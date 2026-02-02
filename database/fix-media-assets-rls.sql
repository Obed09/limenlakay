-- ============================================
-- FIX: Media Assets RLS Policy (Simple Version)
-- Allows INSERT operations on media_assets table
-- ============================================

-- Disable RLS temporarily to allow operations
ALTER TABLE media_assets DISABLE ROW LEVEL SECURITY;

-- Re-enable with simpler approach
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Allow public read on media_assets" ON media_assets;
DROP POLICY IF EXISTS "Allow all operations on media_assets" ON media_assets;

-- Create new policy that allows everything
CREATE POLICY "Allow all on media_assets" 
  ON media_assets 
  FOR ALL 
  TO public
  USING (true)
  WITH CHECK (true);

-- Test: This should now work
-- INSERT INTO media_assets (file_url, file_type, content_type, product_type) 
-- VALUES ('test.jpg', 'image', 'finished_piece', 'candle');
