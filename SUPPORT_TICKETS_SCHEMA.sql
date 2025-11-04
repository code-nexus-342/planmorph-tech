-- Support Ticket System Database Schema
-- Run this SQL script in your Digital Ocean database console

-- =====================================================
-- CLIENTS TABLE (stores client information for support access)
-- =====================================================
CREATE TABLE IF NOT EXISTS support_clients (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  company_name VARCHAR(255),
  project_id INTEGER, -- Reference to project_requests.id if linked
  
  -- Support plan details
  plan_type VARCHAR(50) NOT NULL DEFAULT 'basic', -- 'basic', 'standard', 'premium'
  plan_features JSONB, -- Store plan-specific features
  plan_expiry_date TIMESTAMP,
  
  -- Authentication
  password_hash VARCHAR(255), -- For client portal login
  access_token VARCHAR(255), -- Temporary access token for passwordless login
  token_expires_at TIMESTAMP,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SUPPORT TICKETS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS support_tickets (
  id SERIAL PRIMARY KEY,
  ticket_number VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'ST-00001'
  
  -- Client information
  client_id INTEGER REFERENCES support_clients(id) ON DELETE CASCADE,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_phone VARCHAR(50),
  
  -- Ticket details
  subject VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL, -- 'bug', 'feature_request', 'technical_issue', 'billing', 'general'
  priority VARCHAR(50) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status VARCHAR(50) NOT NULL DEFAULT 'open', -- 'open', 'in_progress', 'waiting_client', 'resolved', 'closed'
  
  -- Plan-based features
  client_plan VARCHAR(50) NOT NULL DEFAULT 'basic',
  response_sla_hours INTEGER, -- Service Level Agreement response time in hours
  
  -- Assignment
  assigned_to INTEGER REFERENCES users(id), -- Admin user handling the ticket
  assigned_at TIMESTAMP,
  
  -- Resolution
  resolution_notes TEXT,
  resolved_at TIMESTAMP,
  resolved_by INTEGER REFERENCES users(id),
  closed_at TIMESTAMP,
  
  -- Metadata
  tags TEXT[], -- Array of tags for categorization
  attachments JSONB, -- Store attachment URLs/metadata
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_response_at TIMESTAMP
);

-- =====================================================
-- TICKET MESSAGES TABLE (conversation thread)
-- =====================================================
CREATE TABLE IF NOT EXISTS ticket_messages (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER REFERENCES support_tickets(id) ON DELETE CASCADE,
  
  -- Message details
  sender_type VARCHAR(50) NOT NULL, -- 'client' or 'admin'
  sender_id INTEGER, -- client_id or user_id depending on sender_type
  sender_name VARCHAR(255) NOT NULL,
  sender_email VARCHAR(255) NOT NULL,
  
  message TEXT NOT NULL,
  attachments JSONB, -- Array of attachment objects
  
  -- Status
  is_internal_note BOOLEAN DEFAULT false, -- True if admin-only note
  is_read BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TICKET ACTIVITY LOG (audit trail)
-- =====================================================
CREATE TABLE IF NOT EXISTS ticket_activity_log (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER REFERENCES support_tickets(id) ON DELETE CASCADE,
  
  action VARCHAR(100) NOT NULL, -- 'created', 'status_changed', 'priority_changed', 'assigned', 'message_added', etc.
  actor_type VARCHAR(50) NOT NULL, -- 'client', 'admin', 'system'
  actor_id INTEGER,
  actor_name VARCHAR(255),
  
  details JSONB, -- Store action-specific details
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_support_tickets_client_id ON support_tickets(client_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at DESC);
CREATE INDEX idx_support_tickets_ticket_number ON support_tickets(ticket_number);

CREATE INDEX idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
CREATE INDEX idx_ticket_messages_created_at ON ticket_messages(created_at DESC);

CREATE INDEX idx_ticket_activity_ticket_id ON ticket_activity_log(ticket_id);

CREATE INDEX idx_support_clients_email ON support_clients(email);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_support_clients_updated_at
    BEFORE UPDATE ON support_clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGER TO AUTO-UPDATE last_response_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_ticket_last_response()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE support_tickets 
    SET last_response_at = NEW.created_at 
    WHERE id = NEW.ticket_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_last_response_on_message
    AFTER INSERT ON ticket_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_ticket_last_response();

-- =====================================================
-- SAMPLE SUPPORT PLANS (for reference)
-- =====================================================
-- Basic Plan: 48-hour response, email support only
-- Standard Plan: 24-hour response, email + chat support
-- Premium Plan: 4-hour response, priority support, dedicated support manager

COMMENT ON TABLE support_clients IS 'Stores client information for support portal access';
COMMENT ON TABLE support_tickets IS 'Main tickets table with priority, SLA, and assignment tracking';
COMMENT ON TABLE ticket_messages IS 'Conversation thread for each ticket';
COMMENT ON TABLE ticket_activity_log IS 'Audit trail of all ticket actions';

COMMENT ON COLUMN support_tickets.response_sla_hours IS 'SLA response time based on client plan: Basic=48h, Standard=24h, Premium=4h';
COMMENT ON COLUMN support_tickets.priority IS 'Priority set by admin based on issue severity and client plan';
