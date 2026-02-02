-- Add registration_enabled column to workshop_sessions table
-- This allows toggling registration on/off for individual sessions

ALTER TABLE workshop_sessions 
ADD COLUMN IF NOT EXISTS registration_enabled BOOLEAN DEFAULT true;

-- Update existing sessions to have registration enabled by default
UPDATE workshop_sessions 
SET registration_enabled = true 
WHERE registration_enabled IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN workshop_sessions.registration_enabled IS 'Controls whether users can register for this specific workshop session';
