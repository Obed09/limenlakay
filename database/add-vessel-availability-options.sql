-- Add Vessel Availability Options
-- This allows admins to control how vessels can be purchased

-- Add new columns to candle_vessels table
ALTER TABLE candle_vessels 
ADD COLUMN IF NOT EXISTS allow_custom_candle BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_empty_vessel BOOLEAN DEFAULT false;

-- Update existing vessels to have sensible defaults
-- All existing vessels can be used for custom candles, but not sold empty
UPDATE candle_vessels 
SET 
  allow_custom_candle = true,
  allow_empty_vessel = false
WHERE allow_custom_candle IS NULL OR allow_empty_vessel IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vessels_custom_candle ON candle_vessels(allow_custom_candle) WHERE allow_custom_candle = true;
CREATE INDEX IF NOT EXISTS idx_vessels_empty_vessel ON candle_vessels(allow_empty_vessel) WHERE allow_empty_vessel = true;

-- Add comments for documentation
COMMENT ON COLUMN candle_vessels.allow_custom_candle IS 'If true, vessel appears in "Create Custom Candle" page where clients can pick scent';
COMMENT ON COLUMN candle_vessels.allow_empty_vessel IS 'If true, vessel can be purchased empty without candle/scent';

-- Helpful query to see vessel availability settings
-- SELECT name, color, size, allow_custom_candle, allow_empty_vessel FROM candle_vessels ORDER BY name;
