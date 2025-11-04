import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../db.js';
// authMiddleware.js exports a default middleware function named `authMiddleware`.
// Import it as the expected `authenticateToken` middleware for route protection.
import authenticateToken from '../middleware/authMiddleware.js';
import emailService from '../services/emailService.js';

const router = express.Router();

// Submit talent application (public route - but hidden from regular users)
router.post(
  '/apply',
  [
    body('full_name').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').optional().trim(),
    body('location').optional().trim(),
    body('role').isIn(['developer', 'designer', 'both']).withMessage('Valid role is required'),
    body('specialization').trim().notEmpty().withMessage('Specialization is required'),
    body('experience_level').isIn(['beginner', 'intermediate', 'advanced', 'expert']).withMessage('Valid experience level is required'),
    body('years_of_experience').optional().isInt({ min: 0 }),
    body('skills').isArray({ min: 1 }).withMessage('At least one skill is required'),
    body('why_join').trim().notEmpty().withMessage('Please tell us why you want to join'),
    body('availability').isIn(['immediate', 'two_weeks', 'one_month', 'flexible']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      full_name,
      email,
      phone,
      location,
      role,
      specialization,
      experience_level,
      years_of_experience,
      portfolio_url,
      github_url,
      linkedin_url,
      behance_url,
      dribbble_url,
      skills,
      technologies,
      notable_projects,
      previous_companies,
      why_join,
      availability,
      expected_salary_range,
    } = req.body;

    try {
      // Check if email already exists
      const existingApplication = await pool.query(
        'SELECT id FROM talent_applications WHERE email = $1',
        [email]
      );

      if (existingApplication.rows.length > 0) {
        return res.status(400).json({ error: 'An application with this email already exists' });
      }

      // Determine if assessment is needed (for beginners/those with less experience)
      const needs_assessment = experience_level === 'beginner' || 
                              (years_of_experience && years_of_experience < 2) ||
                              !portfolio_url;

      const result = await pool.query(
        `INSERT INTO talent_applications (
          full_name, email, phone, location, role, specialization,
          experience_level, years_of_experience, portfolio_url, github_url,
          linkedin_url, behance_url, dribbble_url, skills, technologies,
          notable_projects, previous_companies, why_join, availability,
          expected_salary_range, needs_assessment
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        RETURNING id, email, full_name`,
        [
          full_name, email, phone, location, role, specialization,
          experience_level, years_of_experience, portfolio_url, github_url,
          linkedin_url, behance_url, dribbble_url, skills, technologies,
          notable_projects ? JSON.stringify(notable_projects) : null,
          previous_companies, why_join, availability,
          expected_salary_range, needs_assessment
        ]
      );

      const application = result.rows[0];

      // Send confirmation email to applicant
      await emailService.sendTalentEmail(
        email,
        full_name,
        'application_received',
        { applicationId: application.id, needsAssessment: needs_assessment }
      );

      res.status(201).json({
        message: 'Application submitted successfully',
        applicationId: application.id,
        needsAssessment: needs_assessment,
      });
    } catch (error) {
      console.error('Error submitting talent application:', error);
      res.status(500).json({ error: 'Failed to submit application' });
    }
  }
);

// Get all applications (admin only)
router.get('/applications', authenticateToken, async (req, res) => {
  try {
    const { status, role, experience_level } = req.query;
    
    let query = 'SELECT * FROM talent_applications WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (role) {
      query += ` AND role = $${paramCount}`;
      params.push(role);
      paramCount++;
    }

    if (experience_level) {
      query += ` AND experience_level = $${paramCount}`;
      params.push(experience_level);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Get single application (admin only)
router.get('/applications/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM talent_applications WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Also get related assessments and interviews
    const assessments = await pool.query(
      'SELECT * FROM talent_assessments WHERE application_id = $1 ORDER BY created_at DESC',
      [id]
    );

    const interviews = await pool.query(
      'SELECT * FROM talent_interviews WHERE application_id = $1 ORDER BY scheduled_at DESC',
      [id]
    );

    const communications = await pool.query(
      'SELECT * FROM talent_communications WHERE application_id = $1 ORDER BY created_at DESC',
      [id]
    );

    res.json({
      application: result.rows[0],
      assessments: assessments.rows,
      interviews: interviews.rows,
      communications: communications.rows,
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

// Update application status (admin only)
router.patch('/applications/:id/status', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status, admin_notes } = req.body;

  try {
    const result = await pool.query(
      `UPDATE talent_applications 
       SET status = $1, admin_notes = $2, reviewed_by = $3, reviewed_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [status, admin_notes, req.user.userId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const application = result.rows[0];

    // Send status update email
    await emailService.sendTalentEmail(
      application.email,
      application.full_name,
      status,
      { applicationId: id, notes: admin_notes }
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

// Assign assessment task (admin only)
router.post('/applications/:id/assessment', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { task_title, task_description, task_requirements, task_type, deadline_days } = req.body;

  try {
    // Calculate deadline
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + (deadline_days || 7));

    const result = await pool.query(
      `INSERT INTO talent_assessments (
        application_id, task_title, task_description, task_requirements,
        task_type, deadline
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [id, task_title, task_description, task_requirements, task_type, deadline]
    );

    // Update application status
    await pool.query(
      `UPDATE talent_applications 
       SET status = 'assessment_assigned', needs_assessment = true,
           assessment_task = $1, assessment_deadline = $2
       WHERE id = $3`,
      [task_title, deadline, id]
    );

    // Get applicant info for email
    const appResult = await pool.query(
      'SELECT email, full_name FROM talent_applications WHERE id = $1',
      [id]
    );
    const applicant = appResult.rows[0];

    // Send assessment email
    await emailService.sendTalentEmail(
      applicant.email,
      applicant.full_name,
      'assessment_assigned',
      {
        taskTitle: task_title,
        taskDescription: task_description,
        deadline: deadline.toLocaleDateString(),
        applicationId: id,
      }
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error assigning assessment:', error);
    res.status(500).json({ error: 'Failed to assign assessment' });
  }
});

// Schedule interview (admin only)
router.post('/applications/:id/interview', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { interview_type, scheduled_at, duration_minutes, meeting_link, location, notes } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO talent_interviews (
        application_id, interview_type, scheduled_at, duration_minutes,
        meeting_link, location, notes, interviewer_ids
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [id, interview_type, scheduled_at, duration_minutes, meeting_link, location, notes, [req.user.userId]]
    );

    // Update application status
    await pool.query(
      `UPDATE talent_applications 
       SET status = 'interview_scheduled', interview_scheduled_at = $1
       WHERE id = $2`,
      [scheduled_at, id]
    );

    // Get applicant info
    const appResult = await pool.query(
      'SELECT email, full_name FROM talent_applications WHERE id = $1',
      [id]
    );
    const applicant = appResult.rows[0];

    // Send interview email
    await emailService.sendTalentEmail(
      applicant.email,
      applicant.full_name,
      'interview_scheduled',
      {
        interviewType: interview_type,
        scheduledAt: new Date(scheduled_at).toLocaleString(),
        meetingLink: meeting_link,
        location: location,
        duration: duration_minutes,
      }
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error scheduling interview:', error);
    res.status(500).json({ error: 'Failed to schedule interview' });
  }
});

export default router;
