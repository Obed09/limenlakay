-- Add registration_enabled column to workshop_sessions table
-- This allows toggling registration on/off for individual sessions

-- Check if column exists before adding it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'workshop_sessions' 
        AND column_name = 'registration_enabled'
    ) THEN
        ALTER TABLE workshop_sessions 
        ADD COLUMN registration_enabled BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Update existing sessions to have registration enabled by default
UPDATE workshop_sessions 
SET registration_enabled = true 
WHERE registration_enabled IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN workshop_sessions.registration_enabled IS 'Controls whether users can register for this specific workshop session';
