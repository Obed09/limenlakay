-- Add SKU column to candle_vessels table
ALTER TABLE candle_vessels 
ADD COLUMN IF NOT EXISTS sku TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_candle_vessels_sku ON candle_vessels(sku);

-- Function to generate next SKU
CREATE OR REPLACE FUNCTION generate_next_sku()
RETURNS TEXT AS $$
DECLARE
  last_sku TEXT;
  next_number INT;
BEGIN
  -- Get the last SKU number
  SELECT sku INTO last_sku 
  FROM candle_vessels 
  WHERE sku LIKE 'LL-%' 
  ORDER BY sku DESC 
  LIMIT 1;
  
  -- If no SKUs exist, start at 100
  IF last_sku IS NULL THEN
    RETURN 'LL-100';
  END IF;
  
  -- Extract number and increment
  next_number := CAST(SUBSTRING(last_sku FROM 4) AS INT) + 1;
  
  RETURN 'LL-' || next_number::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Update existing vessels with SKUs if they don't have one
DO $$
DECLARE
  vessel_record RECORD;
  counter INT := 100;
BEGIN
  FOR vessel_record IN 
    SELECT id FROM candle_vessels WHERE sku IS NULL ORDER BY created_at
  LOOP
    UPDATE candle_vessels 
    SET sku = 'LL-' || counter::TEXT 
    WHERE id = vessel_record.id;
    counter := counter + 1;
  END LOOP;
END $$;
