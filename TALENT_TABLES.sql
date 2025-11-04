-- Talent Management System Tables for PlanMorph Tech
-- Run these SQL commands in your Digital Ocean database

-- Table for talent applications
CREATE TABLE IF NOT EXISTS talent_applications (
    id SERIAL PRIMARY KEY,
    
    -- Personal Information
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    location VARCHAR(255),
    
    -- Professional Information
    role VARCHAR(50) NOT NULL CHECK (role IN ('developer', 'designer', 'both')),
    specialization TEXT, -- e.g., "Frontend React", "UI/UX Design", "Full Stack"
    experience_level VARCHAR(50) NOT NULL CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    years_of_experience INTEGER,
    
    -- Portfolio & Work
    portfolio_url TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    behance_url TEXT, -- for designers
    dribbble_url TEXT, -- for designers
    
    -- Skills & Technologies
    skills TEXT[], -- Array of skills
    technologies TEXT[], -- Array of technologies/tools
    
    -- Projects & Experience
    notable_projects JSONB, -- Array of {title, description, url, technologies, role}
    previous_companies TEXT,
    
    -- Application Details
    why_join TEXT NOT NULL,
  availability VARCHAR(50) NOT NULL, -- 'immediate', 'two_weeks', 'one_month', 'flexible'
  expected_salary_range VARCHAR(100), -- Optional salary expectations (final amount decided by admins based on team size)
  
  -- Application status and tracking
    needs_assessment BOOLEAN DEFAULT false, -- If applicant needs to do a task
    assessment_task TEXT, -- Task description if assigned
    assessment_deadline TIMESTAMP,
    assessment_submission_url TEXT,
    assessment_submitted_at TIMESTAMP,
    
    -- Status & Review
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'assessment_assigned', 'assessment_submitted', 'interview_scheduled', 'accepted', 'rejected', 'withdrawn')),
    interview_scheduled_at TIMESTAMP,
    interview_notes TEXT,
    admin_notes TEXT,
    reviewed_by INTEGER REFERENCES users(id),
    reviewed_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Table for skill assessments/tasks
CREATE TABLE IF NOT EXISTS talent_assessments (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES talent_applications(id) ON DELETE CASCADE,
    
    -- Task Details
    task_title VARCHAR(255) NOT NULL,
    task_description TEXT NOT NULL,
    task_requirements TEXT NOT NULL,
    task_type VARCHAR(50) CHECK (task_type IN ('coding', 'design', 'both')),
    
    -- Evaluation Criteria
    evaluation_criteria JSONB, -- Array of criteria with weights
    
    -- Deadline & Submission
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deadline TIMESTAMP NOT NULL,
    submitted_at TIMESTAMP,
    submission_url TEXT,
    submission_notes TEXT,
    
    -- Grading
    score INTEGER CHECK (score >= 0 AND score <= 100),
    feedback TEXT,
    graded_by INTEGER REFERENCES users(id),
    graded_at TIMESTAMP,
    
    -- Status
    status VARCHAR(50) DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'submitted', 'graded', 'passed', 'failed')),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for interview scheduling
CREATE TABLE IF NOT EXISTS talent_interviews (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES talent_applications(id) ON DELETE CASCADE,
    
    -- Interview Details
    interview_type VARCHAR(50) CHECK (interview_type IN ('phone_screening', 'technical', 'cultural_fit', 'final')),
    scheduled_at TIMESTAMP NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    
    -- Meeting Details
    meeting_link TEXT, -- Zoom/Google Meet link
    location TEXT, -- Or physical location
    interviewer_ids INTEGER[], -- Array of admin user IDs
    
    -- Notes & Evaluation
    notes TEXT,
    candidate_feedback TEXT,
    decision VARCHAR(50) CHECK (decision IN ('pending', 'pass', 'fail', 'maybe')),
    
    -- Status
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show')),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for talent communication/emails
CREATE TABLE IF NOT EXISTS talent_communications (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES talent_applications(id) ON DELETE CASCADE,
    
    -- Communication Details
    type VARCHAR(50) CHECK (type IN ('application_received', 'under_review', 'assessment_assigned', 'interview_scheduled', 'accepted', 'rejected', 'follow_up')),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Email Details
    sent_to VARCHAR(255) NOT NULL,
    sent_by INTEGER REFERENCES users(id),
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Status
    status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'bounced', 'failed')),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_talent_applications_email ON talent_applications(email);
CREATE INDEX idx_talent_applications_status ON talent_applications(status);
CREATE INDEX idx_talent_applications_role ON talent_applications(role);
CREATE INDEX idx_talent_applications_created_at ON talent_applications(created_at DESC);
CREATE INDEX idx_talent_assessments_application_id ON talent_assessments(application_id);
CREATE INDEX idx_talent_assessments_status ON talent_assessments(status);
CREATE INDEX idx_talent_interviews_application_id ON talent_interviews(application_id);
CREATE INDEX idx_talent_interviews_scheduled_at ON talent_interviews(scheduled_at);
CREATE INDEX idx_talent_communications_application_id ON talent_communications(application_id);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update timestamp triggers
CREATE TRIGGER update_talent_applications_updated_at BEFORE UPDATE ON talent_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_talent_assessments_updated_at BEFORE UPDATE ON talent_assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_talent_interviews_updated_at BEFORE UPDATE ON talent_interviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
