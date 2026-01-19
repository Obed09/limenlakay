-- Create scents table for managing candle scents
CREATE TABLE IF NOT EXISTS scents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  name_english TEXT NOT NULL,
  notes TEXT NOT NULL,
  description TEXT NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for available scents
CREATE INDEX IF NOT EXISTS idx_scents_available ON scents(is_available);

-- Enable Row Level Security
ALTER TABLE scents ENABLE ROW LEVEL SECURITY;

-- Allow public read access to available scents
CREATE POLICY "Allow public read access to scents"
  ON scents
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated users to manage scents"
  ON scents
  FOR ALL
  USING (auth.role() = 'authenticated');
