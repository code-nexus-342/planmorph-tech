import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { sendNewRequestNotification, sendClientConfirmationEmail } from '../services/emailService.js';

const router = express.Router();

/**
 * @route   POST /api/requests
 * @desc    Submit a new project request (Client-facing)
 * @access  Public
 */
router.post(
  '/',
  [
    body('client_name')
      .trim()
      .notEmpty()
      .withMessage('Client name is required')
      .isLength({ min: 2, max: 255 })
      .withMessage('Client name must be between 2 and 255 characters'),
    body('client_email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('client_phone')
      .trim()
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^(\+254|0)?[17]\d{8}$/)
      .withMessage('Please provide a valid Kenyan phone number'),
    body('company_name')
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage('Company name must not exceed 255 characters'),
    body('project_type')
      .trim()
      .notEmpty()
      .withMessage('Project type is required')
      .isIn([
        'E-commerce Website',
        'Business Website',
        'Web Application',
        'AI Chatbot Integration',
        'Business Automation',
        'Data Analytics Dashboard',
        'Custom Solution',
        'Other'
      ])
      .withMessage('Invalid project type'),
    body('requirements')
      .trim()
      .notEmpty()
      .withMessage('Project requirements are required')
      .isLength({ min: 20, max: 5000 })
      .withMessage('Requirements must be between 20 and 5000 characters'),
    body('budget_range')
      .optional()
      .trim()
      .isIn([
        'Under KES 50,000',
        'KES 50,000 - 100,000',
        'KES 100,000 - 250,000',
        'KES 250,000 - 500,000',
        'Above KES 500,000',
        'Not Sure'
      ])
      .withMessage('Invalid budget range'),
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

      const {
        client_name,
        client_email,
        client_phone,
        company_name,
        project_type,
        requirements,
        budget_range
      } = req.body;

      // Insert request into database
      const result = await query(
        `INSERT INTO project_requests 
        (client_name, client_email, client_phone, company_name, project_type, requirements, budget_range, status) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING *`,
        [client_name, client_email, client_phone, company_name || null, project_type, requirements, budget_range || null, 'Pending']
      );

      const newRequest = result.rows[0];

      // Send notification email to admin (non-blocking)
      sendNewRequestNotification(newRequest).catch(err => {
        console.error('Failed to send admin notification:', err);
      });

      // Send confirmation email to client (non-blocking)
      sendClientConfirmationEmail(newRequest).catch(err => {
        console.error('Failed to send client confirmation:', err);
      });

      res.status(201).json({
        message: 'Project request submitted successfully! We will review your request and get back to you within 24 hours.',
        request: {
          id: newRequest.id,
          client_name: newRequest.client_name,
          project_type: newRequest.project_type,
          status: newRequest.status,
          created_at: newRequest.created_at
        }
      });

    } catch (error) {
      console.error('Create request error:', error);
      res.status(500).json({
        error: 'Submission Failed',
        message: 'An error occurred while submitting your request. Please try again.'
      });
    }
  }
);

/**
 * @route   GET /api/requests
 * @desc    Get all project requests (Admin)
 * @access  Protected
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    let queryText = 'SELECT * FROM project_requests';
    const queryParams = [];

    // Filter by status if provided
    if (status) {
      queryText += ' WHERE status = $1';
      queryParams.push(status);
    }

    // Order by most recent first
    queryText += ' ORDER BY created_at DESC';

    // Add pagination
    queryText += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const result = await query(queryText, queryParams);

    // Get total count
    const countQuery = status 
      ? 'SELECT COUNT(*) FROM project_requests WHERE status = $1'
      : 'SELECT COUNT(*) FROM project_requests';
    const countResult = await query(countQuery, status ? [status] : []);
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      requests: result.rows,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < totalCount
      }
    });

  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: 'An error occurred while fetching requests'
    });
  }
});

/**
 * @route   GET /api/requests/:id
 * @desc    Get a single project request by ID (Admin)
 * @access  Protected
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM project_requests WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Project request not found'
      });
    }

    res.json({
      request: result.rows[0]
    });

  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: 'An error occurred while fetching the request'
    });
  }
});

/**
 * @route   PUT /api/requests/:id
 * @desc    Update a project request status (Admin)
 * @access  Protected
 */
router.put(
  '/:id',
  authMiddleware,
  [
    body('status')
      .optional()
      .isIn(['Pending', 'Approved', 'Rejected', 'Quoted'])
      .withMessage('Invalid status value'),
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

      const { id } = req.params;
      const { status } = req.body;

      // Check if request exists
      const checkResult = await query(
        'SELECT id FROM project_requests WHERE id = $1',
        [id]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Project request not found'
        });
      }

      // Update request
      const result = await query(
        'UPDATE project_requests SET status = $1 WHERE id = $2 RETURNING *',
        [status, id]
      );

      res.json({
        message: 'Request updated successfully',
        request: result.rows[0]
      });

    } catch (error) {
      console.error('Update request error:', error);
      res.status(500).json({
        error: 'Update Failed',
        message: 'An error occurred while updating the request'
      });
    }
  }
);

/**
 * @route   DELETE /api/requests/:id
 * @desc    Delete a project request (Admin)
 * @access  Protected
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if request exists
    const checkResult = await query(
      'SELECT id FROM project_requests WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Project request not found'
      });
    }

    // Delete request (CASCADE will also delete associated quotes)
    await query('DELETE FROM project_requests WHERE id = $1', [id]);

    res.json({
      message: 'Request deleted successfully'
    });

  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({
      error: 'Delete Failed',
      message: 'An error occurred while deleting the request'
    });
  }
});

export default router;
