-- Migration script to remove work_type column from talent_applications
-- Run this ONLY if you've already created the talent_applications table
-- This is safe to run even if the column doesn't exist (will just show an error message but won't break anything)

-- Remove work_type column
ALTER TABLE talent_applications 
DROP COLUMN IF EXISTS work_type;

-- Add comment to expected_salary_range column
COMMENT ON COLUMN talent_applications.expected_salary_range IS 'Optional salary expectations. Final compensation is determined by admins based on project requirements and team size. All positions are full-time.';

-- Verify the change
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'talent_applications' 
  AND column_name IN ('work_type', 'expected_salary_range', 'availability')
ORDER BY ordinal_position;
