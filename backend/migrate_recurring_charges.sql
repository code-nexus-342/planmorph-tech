-- Add recurring charges columns to quotations table
ALTER TABLE quotations 
ADD COLUMN IF NOT EXISTS recurring_cost DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS recurring_period VARCHAR(50) DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS recurring_description TEXT;

-- Add check constraint for recurring_period
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_recurring_period'
    ) THEN
        ALTER TABLE quotations 
        ADD CONSTRAINT chk_recurring_period 
        CHECK (recurring_period IN ('monthly', 'quarterly', 'yearly', 'none'));
    END IF;
END $$;
