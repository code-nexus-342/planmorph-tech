import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { query } from '../db.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new admin user
 * @access  Public (Should be protected in production - use once)
 */
router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation Error',
          details: errors.array() 
        });
      }

      const { email, password } = req.body;

      // Check if user already exists
      const existingUser = await query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({
          error: 'User Already Exists',
          message: 'An account with this email already exists'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create user
      const result = await query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
        [email, passwordHash]
      );

      const newUser = result.rows[0];

      res.status(201).json({
        message: 'Admin user created successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          created_at: newUser.created_at
        }
      });

    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        error: 'Registration Failed',
        message: 'An error occurred during registration'
      });
    }
  }
);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate admin and get token
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation Error',
          details: errors.array() 
        });
      }

      const { email, password } = req.body;

      // Find user
      const result = await query(
        'SELECT id, email, password_hash FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          error: 'Authentication Failed',
          message: 'Invalid email or password'
        });
      }

      const user = result.rows[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Authentication Failed',
          message: 'Invalid email or password'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Login Failed',
        message: 'An error occurred during login'
      });
    }
  }
);

/**
 * @route   POST /api/auth/verify
 * @desc    Verify JWT token
 * @access  Public
 */
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Token Required',
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.json({
      valid: true,
      user: {
        id: decoded.id,
        email: decoded.email
      }
    });

  } catch (error) {
    res.status(401).json({
      valid: false,
      error: 'Invalid Token',
      message: 'Token verification failed'
    });
  }
});

/**
 * @route   POST /api/auth/request-reset
 * @desc    Request password reset (sends email with reset token)
 * @access  Public
 */
router.post(
  '/request-reset',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation Error',
          details: errors.array() 
        });
      }

      const { email } = req.body;

      // Check if user exists
      const result = await query(
        'SELECT id, email FROM users WHERE email = $1',
        [email]
      );

      // Always return success to prevent email enumeration
      if (result.rows.length === 0) {
        return res.json({
          message: 'If an account exists with this email, a password reset link has been sent.'
        });
      }

      const user = result.rows[0];

      // Generate reset token (valid for 1 hour)
      const resetToken = jwt.sign(
        { id: user.id, email: user.email, type: 'password-reset' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Send email with reset token
      const { sendPasswordResetEmail } = await import('../services/emailService.js');
      await sendPasswordResetEmail(user.email, resetToken);

      res.json({
        message: 'If an account exists with this email, a password reset link has been sent.'
      });

    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({
        error: 'Request Failed',
        message: 'An error occurred while processing your request'
      });
    }
  }
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
  '/reset-password',
  [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation Error',
          details: errors.array() 
        });
      }

      const { token, newPassword } = req.body;

      // Verify token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if it's a password reset token
        if (decoded.type !== 'password-reset') {
          throw new Error('Invalid token type');
        }
      } catch (error) {
        return res.status(401).json({
          error: 'Invalid Token',
          message: 'Reset token is invalid or has expired'
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(newPassword, salt);

      // Update password
      await query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [passwordHash, decoded.id]
      );

      res.json({
        message: 'Password reset successfully. You can now login with your new password.'
      });

    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({
        error: 'Reset Failed',
        message: 'An error occurred while resetting your password'
      });
    }
  }
);

export default router;
