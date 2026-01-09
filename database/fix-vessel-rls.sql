-- Fix RLS policies for admin vessel management
-- Drop existing policies
DROP POLICY IF EXISTS "Allow anonymous read vessels" ON candle_vessels;
DROP POLICY IF EXISTS "Allow anonymous insert vessels" ON candle_vessels;
DROP POLICY IF EXISTS "Allow anonymous update vessels" ON candle_vessels;
DROP POLICY IF EXISTS "Allow anonymous delete vessels" ON candle_vessels;

-- Create permissive policies for all operations
CREATE POLICY "Enable read access for all users" ON candle_vessels
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON candle_vessels
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON candle_vessels
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON candle_vessels
  FOR DELETE USING (true);
