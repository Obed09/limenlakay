-- Update workshop sessions max_participants default to 5
-- Run this to update existing database

-- Update the default for new sessions
ALTER TABLE workshop_sessions 
ALTER COLUMN max_participants SET DEFAULT 5;

-- Optionally update existing open sessions (uncomment if needed)
-- UPDATE workshop_sessions 
-- SET max_participants = 5 
-- WHERE status = 'open' AND max_participants = 12;

-- Verify the change
SELECT 
  id, 
  session_date, 
  session_time, 
  max_participants, 
  current_participants,
  status
FROM workshop_sessions
ORDER BY session_date;
