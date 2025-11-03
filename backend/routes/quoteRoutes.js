import express from 'express';
import { body, validationResult } from 'express-validator';
import { query, getClient } from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { sendQuoteEmail } from '../services/emailService.js';

const router = express.Router();

/**
 * @route   POST /api/quotes
 * @desc    Create and send a new quotation (Admin)
 * @access  Protected
 */
router.post(
  '/',
  authMiddleware,
  [
    body('request_id')
      .isInt({ min: 1 })
      .withMessage('Valid request ID is required'),
    body('total_cost')
      .isFloat({ min: 0 })
      .withMessage('Total cost must be a positive number'),
    body('timeline_weeks')
      .isInt({ min: 1, max: 104 })
      .withMessage('Timeline must be between 1 and 104 weeks'),
    body('cost_breakdown')
      .optional()
      .isObject()
      .withMessage('Cost breakdown must be an object'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Notes must not exceed 2000 characters'),
    body('recurring_cost')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Recurring cost must be a positive number'),
    body('recurring_period')
      .optional()
      .isIn(['monthly', 'quarterly', 'yearly', 'none'])
      .withMessage('Recurring period must be monthly, quarterly, yearly, or none'),
    body('recurring_description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Recurring description must not exceed 500 characters'),
  ],
  async (req, res) => {
    const client = await getClient();
    
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
        request_id,
        total_cost,
        timeline_weeks,
        cost_breakdown,
        notes,
        recurring_cost,
        recurring_period,
        recurring_description
      } = req.body;

      // Start transaction
      await client.query('BEGIN');

      // Get the project request details
      const requestResult = await client.query(
        'SELECT * FROM project_requests WHERE id = $1',
        [request_id]
      );

      if (requestResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          error: 'Not Found',
          message: 'Project request not found'
        });
      }

      const projectRequest = requestResult.rows[0];

      // Insert quotation
      const quoteResult = await client.query(
        `INSERT INTO quotations 
        (request_id, total_cost, timeline_weeks, cost_breakdown, notes, recurring_cost, recurring_period, recurring_description) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING *`,
        [
          request_id,
          total_cost,
          timeline_weeks,
          cost_breakdown ? JSON.stringify(cost_breakdown) : null,
          notes || null,
          recurring_cost || 0,
          recurring_period || 'none',
          recurring_description || null
        ]
      );

      const newQuote = quoteResult.rows[0];

      // Update request status to 'Quoted'
      await client.query(
        'UPDATE project_requests SET status = $1 WHERE id = $2',
        ['Quoted', request_id]
      );

      // Commit transaction
      await client.query('COMMIT');

      // Send email to client (non-blocking)
      const emailPromise = sendQuoteEmail(
        projectRequest.client_email,
        {
          total_cost: newQuote.total_cost,
          timeline_weeks: newQuote.timeline_weeks,
          cost_breakdown: newQuote.cost_breakdown,
          notes: newQuote.notes
        },
        {
          client_name: projectRequest.client_name,
          project_type: projectRequest.project_type,
          requirements: projectRequest.requirements
        }
      );

      // Wait for email to send (with timeout)
      const emailTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email timeout')), 10000)
      );

      try {
        await Promise.race([emailPromise, emailTimeout]);
        
        res.status(201).json({
          message: 'Quotation created and sent successfully!',
          quote: {
            id: newQuote.id,
            request_id: newQuote.request_id,
            total_cost: newQuote.total_cost,
            timeline_weeks: newQuote.timeline_weeks,
            sent_at: newQuote.sent_at
          },
          email_sent: true
        });

      } catch (emailError) {
        console.error('Email sending error:', emailError);
        
        // Even if email fails, quote is saved
        res.status(201).json({
          message: 'Quotation created but email failed to send. Please send manually.',
          quote: {
            id: newQuote.id,
            request_id: newQuote.request_id,
            total_cost: newQuote.total_cost,
            timeline_weeks: newQuote.timeline_weeks,
            sent_at: newQuote.sent_at
          },
          email_sent: false,
          email_error: emailError.message
        });
      }

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Create quote error:', error);
      res.status(500).json({
        error: 'Quote Creation Failed',
        message: 'An error occurred while creating the quotation'
      });
    } finally {
      client.release();
    }
  }
);

/**
 * @route   GET /api/quotes/request/:requestId
 * @desc    Get all quotes for a specific request (Admin)
 * @access  Protected
 */
router.get('/request/:requestId', authMiddleware, async (req, res) => {
  try {
    const { requestId } = req.params;

    // Check if request exists
    const requestCheck = await query(
      'SELECT id FROM project_requests WHERE id = $1',
      [requestId]
    );

    if (requestCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Project request not found'
      });
    }

    // Get all quotes for this request
    const result = await query(
      'SELECT * FROM quotations WHERE request_id = $1 ORDER BY sent_at DESC',
      [requestId]
    );

    res.json({
      quotes: result.rows
    });

  } catch (error) {
    console.error('Get quotes error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: 'An error occurred while fetching quotes'
    });
  }
});

/**
 * @route   GET /api/quotes/:id
 * @desc    Get a single quote by ID (Admin)
 * @access  Protected
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT q.*, pr.client_name, pr.client_email, pr.project_type 
       FROM quotations q 
       JOIN project_requests pr ON q.request_id = pr.id 
       WHERE q.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Quote not found'
      });
    }

    res.json({
      quote: result.rows[0]
    });

  } catch (error) {
    console.error('Get quote error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: 'An error occurred while fetching the quote'
    });
  }
});

/**
 * @route   DELETE /api/quotes/:id
 * @desc    Delete a quote (Admin)
 * @access  Protected
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if quote exists
    const checkResult = await query(
      'SELECT id, request_id FROM quotations WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Quote not found'
      });
    }

    // Delete quote
    await query('DELETE FROM quotations WHERE id = $1', [id]);

    res.json({
      message: 'Quote deleted successfully'
    });

  } catch (error) {
    console.error('Delete quote error:', error);
    res.status(500).json({
      error: 'Delete Failed',
      message: 'An error occurred while deleting the quote'
    });
  }
});

/**
 * @route   GET /api/quotes
 * @desc    Get all quotes (Admin)
 * @access  Protected
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const result = await query(
      `SELECT q.*, pr.client_name, pr.client_email, pr.project_type 
       FROM quotations q 
       JOIN project_requests pr ON q.request_id = pr.id 
       ORDER BY q.sent_at DESC 
       LIMIT $1 OFFSET $2`,
      [parseInt(limit), parseInt(offset)]
    );

    // Get total count
    const countResult = await query('SELECT COUNT(*) FROM quotations');
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      quotes: result.rows,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < totalCount
      }
    });

  } catch (error) {
    console.error('Get all quotes error:', error);
    res.status(500).json({
      error: 'Fetch Failed',
      message: 'An error occurred while fetching quotes'
    });
  }
});

export default router;
