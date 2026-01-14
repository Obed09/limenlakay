-- Fix workshop_sessions table to add missing columns and update RLS policies
-- Run this in Supabase SQL Editor

-- First, create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS workshop_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_date TIMESTAMPTZ NOT NULL,
  session_time TEXT NOT NULL,
  meeting_link TEXT,
  max_participants INTEGER DEFAULT 12,
  current_participants INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'full', 'cancelled', 'completed')),
  location TEXT,
  instructor TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add the missing columns if table already exists but columns don't
ALTER TABLE workshop_sessions 
ADD COLUMN IF NOT EXISTS session_time TEXT,
ADD COLUMN IF NOT EXISTS meeting_link TEXT;

-- Drop existing restrictive RLS policies if any exist
DROP POLICY IF EXISTS "Users can view their own bookings" ON workshop_sessions;
DROP POLICY IF EXISTS "Authenticated users can create bookings" ON workshop_sessions;
DROP POLICY IF EXISTS "Service role can manage workshop sessions" ON workshop_sessions;
DROP POLICY IF EXISTS "Anyone can view open workshop sessions" ON workshop_sessions;
DROP POLICY IF EXISTS "Admins can view all bookings" ON workshop_sessions;

-- Enable Row Level Security
ALTER TABLE workshop_sessions ENABLE ROW LEVEL SECURITY;

-- Create new RLS policies that allow:
-- 1. Anyone (including anon) can view open sessions (for booking page)
CREATE POLICY "Anyone can view workshop sessions"
  ON workshop_sessions
  FOR SELECT
  USING (true);

-- 2. Authenticated users can insert sessions (for admin)
CREATE POLICY "Authenticated users can insert workshop sessions"
  ON workshop_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 3. Authenticated users can update sessions (for admin)
CREATE POLICY "Authenticated users can update workshop sessions"
  ON workshop_sessions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Authenticated users can delete sessions (for admin)
CREATE POLICY "Authenticated users can delete workshop sessions"
  ON workshop_sessions
  FOR DELETE
  TO authenticated
  USING (true);

-- 5. Anonymous users can also insert (in case admin is not logged in)
CREATE POLICY "Anonymous users can insert workshop sessions"
  ON workshop_sessions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 6. Anonymous users can update sessions
CREATE POLICY "Anonymous users can update workshop sessions"
  ON workshop_sessions
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- 7. Anonymous users can delete sessions
CREATE POLICY "Anonymous users can delete workshop sessions"
  ON workshop_sessions
  FOR DELETE
  TO anon
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workshop_sessions_date ON workshop_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_workshop_sessions_status ON workshop_sessions(status);

-- Create update trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_workshop_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workshop_sessions_updated_at
  BEFORE UPDATE ON workshop_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_workshop_sessions_updated_at();

-- Verify the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'workshop_sessions'
ORDER BY ordinal_position;
