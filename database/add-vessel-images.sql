-- ============================================================
-- vessel_images: multi-image / color-variant support
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

CREATE TABLE IF NOT EXISTS vessel_images (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id      UUID NOT NULL REFERENCES candle_vessels(id) ON DELETE CASCADE,
  image_url      TEXT NOT NULL,
  color_variant  TEXT NOT NULL DEFAULT 'Default',
  is_primary     BOOLEAN DEFAULT false,
  display_order  INT DEFAULT 0,
  is_available   BOOLEAN DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS vessel_images_vessel_id_idx ON vessel_images(vessel_id);

-- Row Level Security (match the pattern used by candle_vessels)
ALTER TABLE vessel_images ENABLE ROW LEVEL SECURITY;

-- Public can read
CREATE POLICY "vessel_images_public_read"
  ON vessel_images FOR SELECT
  USING (true);

-- Authenticated users can write
CREATE POLICY "vessel_images_auth_write"
  ON vessel_images FOR ALL
  USING (auth.role() = 'authenticated');
