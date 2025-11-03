-- Database initialization script for PlanMorph Tech Consultancy

-- Create users table for admin authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create project_requests table for client submissions
CREATE TABLE IF NOT EXISTS project_requests (
    id SERIAL PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50) NOT NULL,
    company_name VARCHAR(255),
    project_type VARCHAR(100) NOT NULL,
    requirements TEXT NOT NULL,
    budget_range VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Add indexes for better query performance
    CONSTRAINT chk_status CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Quoted'))
);

-- Create quotations table
CREATE TABLE IF NOT EXISTS quotations (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES project_requests(id) ON DELETE CASCADE,
    total_cost DECIMAL(10, 2) NOT NULL,
    timeline_weeks INTEGER NOT NULL,
    cost_breakdown JSONB,
    notes TEXT,
    recurring_cost DECIMAL(10, 2) DEFAULT 0,
    recurring_period VARCHAR(50) DEFAULT 'monthly',
    recurring_description TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Add index for foreign key
    CONSTRAINT fk_request FOREIGN KEY (request_id) REFERENCES project_requests(id),
    CONSTRAINT chk_recurring_period CHECK (recurring_period IN ('monthly', 'quarterly', 'yearly', 'none'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_requests_email ON project_requests(client_email);
CREATE INDEX IF NOT EXISTS idx_project_requests_status ON project_requests(status);
CREATE INDEX IF NOT EXISTS idx_project_requests_created ON project_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotations_request_id ON quotations(request_id);

-- Insert a default admin user
-- To generate a password hash, run: node generateHash.js yourpassword
-- Default credentials (CHANGE IMMEDIATELY):
--   Email: admin@planmorph.com
--   Password: admin123
--   Hash below is for 'admin123'

-- Note: Uncomment and update the hash below after generating it
-- Or manually create admin via POST /api/auth/register endpoint

-- INSERT INTO users (email, password_hash) 
-- VALUES ('admin@planmorph.com', 'YOUR_GENERATED_HASH_HERE')
-- ON CONFLICT (email) DO NOTHING;
