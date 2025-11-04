import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import emailService from '../services/emailService.js';
import crypto from 'crypto';

const router = express.Router();

// =====================================================
// PUBLIC ROUTES (for clients)
// =====================================================

/**
 * Submit a new support ticket (public - clients don't need to be logged in)
 */
router.post(
  '/submit',
  [
    body('full_name').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').optional().trim(),
    body('company_name').optional().trim(),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category').isIn(['bug', 'feature_request', 'technical_issue', 'billing', 'general']),
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
      company_name,
      subject,
      description,
      category,
      project_id,
    } = req.body;

    try {
      // Check if client exists, if not create one
      let client = await pool.query(
        'SELECT * FROM support_clients WHERE email = $1',
        [email]
      );

      let client_id;
      let client_plan = 'basic';

      if (client.rows.length === 0) {
        // Create new client with basic plan
        const newClient = await pool.query(
          `INSERT INTO support_clients (full_name, email, phone, company_name, project_id, plan_type)
           VALUES ($1, $2, $3, $4, $5, 'basic')
           RETURNING id, plan_type`,
          [full_name, email, phone, company_name, project_id]
        );
        client_id = newClient.rows[0].id;
        client_plan = newClient.rows[0].plan_type;
      } else {
        client_id = client.rows[0].id;
        client_plan = client.rows[0].plan_type;
      }

      // Determine SLA based on plan
      const slaHours = {
        basic: 48,
        standard: 24,
        premium: 4,
      };

      // Generate ticket number
      const ticketCountResult = await pool.query('SELECT COUNT(*) FROM support_tickets');
      const ticketCount = parseInt(ticketCountResult.rows[0].count) + 1;
      const ticketNumber = `ST-${String(ticketCount).padStart(5, '0')}`;

      // Create ticket
      const ticket = await pool.query(
        `INSERT INTO support_tickets (
          ticket_number, client_id, client_name, client_email, client_phone,
          subject, description, category, priority, status, client_plan, response_sla_hours
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'medium', 'open', $9, $10)
        RETURNING *`,
        [
          ticketNumber,
          client_id,
          full_name,
          email,
          phone,
          subject,
          description,
          category,
          client_plan,
          slaHours[client_plan],
        ]
      );

      // Log activity
      await pool.query(
        `INSERT INTO ticket_activity_log (ticket_id, action, actor_type, actor_name, details)
         VALUES ($1, 'created', 'client', $2, $3)`,
        [ticket.rows[0].id, full_name, JSON.stringify({ category, plan: client_plan })]
      );

      // Send confirmation email to client
      await emailService.sendSupportTicketEmail(
        email,
        full_name,
        'ticket_created',
        {
          ticketNumber,
          subject,
          category,
          slaHours: slaHours[client_plan],
        }
      );

      // Send notification to admin
      await emailService.sendNewTicketNotification({
        ticketNumber,
        clientName: full_name,
        clientEmail: email,
        subject,
        description,
        category,
        priority: 'medium',
        plan: client_plan,
      });

      res.status(201).json({
        success: true,
        message: 'Support ticket created successfully',
        ticket: {
          id: ticket.rows[0].id,
          ticketNumber,
          status: 'open',
          slaHours: slaHours[client_plan],
        },
      });
    } catch (error) {
      console.error('Error creating support ticket:', error);
      res.status(500).json({ error: 'Failed to create support ticket' });
    }
  }
);

/**
 * Get ticket by ticket number (public - for clients to check status)
 */
router.get('/ticket/:ticketNumber', async (req, res) => {
  try {
    const { ticketNumber } = req.params;
    const { email } = req.query; // Client must provide their email for verification

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const result = await pool.query(
      'SELECT * FROM support_tickets WHERE ticket_number = $1 AND client_email = $2',
      [ticketNumber, email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found or email does not match' });
    }

    // Get messages
    const messages = await pool.query(
      'SELECT * FROM ticket_messages WHERE ticket_id = $1 AND is_internal_note = false ORDER BY created_at ASC',
      [result.rows[0].id]
    );

    res.json({
      ticket: result.rows[0],
      messages: messages.rows,
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

/**
 * Add a message to a ticket (client reply)
 */
router.post(
  '/ticket/:ticketNumber/message',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { ticketNumber } = req.params;
    const { email, message, sender_name } = req.body;

    try {
      // Verify ticket and client
      const ticket = await pool.query(
        'SELECT * FROM support_tickets WHERE ticket_number = $1 AND client_email = $2',
        [ticketNumber, email]
      );

      if (ticket.rows.length === 0) {
        return res.status(404).json({ error: 'Ticket not found or unauthorized' });
      }

      const ticketData = ticket.rows[0];

      // Add message
      const newMessage = await pool.query(
        `INSERT INTO ticket_messages (
          ticket_id, sender_type, sender_id, sender_name, sender_email, message
        ) VALUES ($1, 'client', $2, $3, $4, $5)
        RETURNING *`,
        [ticketData.id, ticketData.client_id, sender_name, email, message]
      );

      // Update ticket status if it was waiting for client
      if (ticketData.status === 'waiting_client') {
        await pool.query(
          'UPDATE support_tickets SET status = $1 WHERE id = $2',
          ['in_progress', ticketData.id]
        );
      }

      // Log activity
      await pool.query(
        `INSERT INTO ticket_activity_log (ticket_id, action, actor_type, actor_name)
         VALUES ($1, 'message_added', 'client', $2)`,
        [ticketData.id, sender_name]
      );

      // Send notification to admin
      await emailService.sendTicketUpdateNotification({
        ticketNumber,
        clientName: sender_name,
        action: 'Client replied',
      });

      res.status(201).json({
        success: true,
        message: 'Reply added successfully',
        data: newMessage.rows[0],
      });
    } catch (error) {
      console.error('Error adding message:', error);
      res.status(500).json({ error: 'Failed to add message' });
    }
  }
);

// =====================================================
// ADMIN ROUTES (require authentication)
// =====================================================

/**
 * Get all tickets (admin only)
 */
router.get('/admin/tickets', authenticateToken, async (req, res) => {
  try {
    const { status, priority, plan, category, assigned_to } = req.query;

    let query = 'SELECT * FROM support_tickets WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (priority) {
      query += ` AND priority = $${paramCount}`;
      params.push(priority);
      paramCount++;
    }

    if (plan) {
      query += ` AND client_plan = $${paramCount}`;
      params.push(plan);
      paramCount++;
    }

    if (category) {
      query += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (assigned_to) {
      query += ` AND assigned_to = $${paramCount}`;
      params.push(assigned_to);
      paramCount++;
    }

    query += ' ORDER BY priority DESC, created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

/**
 * Get single ticket with full details (admin only)
 */
router.get('/admin/tickets/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await pool.query('SELECT * FROM support_tickets WHERE id = $1', [id]);

    if (ticket.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Get all messages (including internal notes)
    const messages = await pool.query(
      'SELECT * FROM ticket_messages WHERE ticket_id = $1 ORDER BY created_at ASC',
      [id]
    );

    // Get activity log
    const activity = await pool.query(
      'SELECT * FROM ticket_activity_log WHERE ticket_id = $1 ORDER BY created_at DESC',
      [id]
    );

    res.json({
      ticket: ticket.rows[0],
      messages: messages.rows,
      activity: activity.rows,
    });
  } catch (error) {
    console.error('Error fetching ticket details:', error);
    res.status(500).json({ error: 'Failed to fetch ticket details' });
  }
});

/**
 * Update ticket (admin only)
 */
router.patch('/admin/tickets/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status, priority, assigned_to, resolution_notes } = req.body;

  try {
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (status) {
      updates.push(`status = $${paramCount}`);
      values.push(status);
      paramCount++;

      // Set resolved_at if status is resolved
      if (status === 'resolved') {
        updates.push(`resolved_at = CURRENT_TIMESTAMP, resolved_by = $${paramCount}`);
        values.push(req.user.id);
        paramCount++;
      }

      // Set closed_at if status is closed
      if (status === 'closed') {
        updates.push(`closed_at = CURRENT_TIMESTAMP`);
      }
    }

    if (priority) {
      updates.push(`priority = $${paramCount}`);
      values.push(priority);
      paramCount++;
    }

    if (assigned_to) {
      updates.push(`assigned_to = $${paramCount}, assigned_at = CURRENT_TIMESTAMP`);
      values.push(assigned_to);
      paramCount++;
    }

    if (resolution_notes) {
      updates.push(`resolution_notes = $${paramCount}`);
      values.push(resolution_notes);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const query = `UPDATE support_tickets SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Log activity
    await pool.query(
      `INSERT INTO ticket_activity_log (ticket_id, action, actor_type, actor_id, actor_name, details)
       VALUES ($1, 'updated', 'admin', $2, $3, $4)`,
      [id, req.user.id, req.user.email, JSON.stringify({ status, priority, assigned_to })]
    );

    // Send email notification to client if status changed
    if (status) {
      const ticket = result.rows[0];
      await emailService.sendSupportTicketEmail(
        ticket.client_email,
        ticket.client_name,
        'status_updated',
        {
          ticketNumber: ticket.ticket_number,
          status,
          resolution_notes,
        }
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

/**
 * Add admin response to ticket
 */
router.post(
  '/admin/tickets/:id/respond',
  authenticateToken,
  [body('message').trim().notEmpty().withMessage('Message is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { message, is_internal_note } = req.body;

    try {
      // Get ticket details
      const ticket = await pool.query('SELECT * FROM support_tickets WHERE id = $1', [id]);

      if (ticket.rows.length === 0) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      const ticketData = ticket.rows[0];

      // Add message
      const newMessage = await pool.query(
        `INSERT INTO ticket_messages (
          ticket_id, sender_type, sender_id, sender_name, sender_email, message, is_internal_note
        ) VALUES ($1, 'admin', $2, $3, $4, $5, $6)
        RETURNING *`,
        [id, req.user.id, req.user.email, req.user.email, message, is_internal_note || false]
      );

      // Update ticket status to in_progress if it was open
      if (ticketData.status === 'open') {
        await pool.query('UPDATE support_tickets SET status = $1 WHERE id = $2', ['in_progress', id]);
      }

      // Log activity
      await pool.query(
        `INSERT INTO ticket_activity_log (ticket_id, action, actor_type, actor_id, actor_name)
         VALUES ($1, 'message_added', 'admin', $2, $3)`,
        [id, req.user.id, req.user.email]
      );

      // Send email to client if not internal note
      if (!is_internal_note) {
        await emailService.sendSupportTicketEmail(
          ticketData.client_email,
          ticketData.client_name,
          'response_received',
          {
            ticketNumber: ticketData.ticket_number,
            message,
          }
        );
      }

      res.status(201).json({
        success: true,
        message: 'Response added successfully',
        data: newMessage.rows[0],
      });
    } catch (error) {
      console.error('Error adding response:', error);
      res.status(500).json({ error: 'Failed to add response' });
    }
  }
);

/**
 * Get ticket statistics (admin only)
 */
router.get('/admin/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_tickets,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open_tickets,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tickets,
        COUNT(CASE WHEN status = 'waiting_client' THEN 1 END) as waiting_client_tickets,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_tickets,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_tickets,
        COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent_tickets,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_tickets,
        COUNT(CASE WHEN client_plan = 'premium' THEN 1 END) as premium_clients,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as tickets_last_7_days
      FROM support_tickets
    `);

    res.json(stats.rows[0]);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
