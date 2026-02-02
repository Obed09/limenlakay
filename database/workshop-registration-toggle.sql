-- ============================================
-- WORKSHOP REGISTRATION TOGGLE
-- Allows admin to enable/disable workshop registration
-- ============================================

-- Create workshop_settings table
CREATE TABLE IF NOT EXISTS workshop_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_enabled BOOLEAN DEFAULT true,
  closed_message TEXT DEFAULT 'Unfortunately, registration is closed at this time. Please check back for the next session.',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
);

-- Insert default settings (only if table is empty)
INSERT INTO workshop_settings (registration_enabled, closed_message)
SELECT true, 'Unfortunately, registration is closed at this time. Please check back for the next session.'
WHERE NOT EXISTS (SELECT 1 FROM workshop_settings);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_workshop_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workshop_settings_updated_at
  BEFORE UPDATE ON workshop_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_workshop_settings_updated_at();

-- Enable RLS
ALTER TABLE workshop_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Allow public read on workshop_settings" 
  ON workshop_settings 
  FOR SELECT 
  USING (true);

-- Allow all operations (admin-controlled)
CREATE POLICY "Allow all operations on workshop_settings" 
  ON workshop_settings 
  FOR ALL 
  USING (true);

COMMENT ON TABLE workshop_settings IS 'Global settings for workshop registration';
