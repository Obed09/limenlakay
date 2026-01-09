-- Function to generate next candle SKU
CREATE OR REPLACE FUNCTION generate_next_candle_sku()
RETURNS TEXT AS $$
DECLARE
  last_vessel_sku TEXT;
  last_candle_sku TEXT;
  last_vessel_num INT := 0;
  last_candle_num INT := 0;
  next_number INT;
BEGIN
  -- Get the last vessel SKU number
  SELECT sku INTO last_vessel_sku 
  FROM candle_vessels 
  WHERE sku LIKE 'LL-%' 
  ORDER BY sku DESC 
  LIMIT 1;
  
  -- Get the last candle SKU number
  SELECT sku INTO last_candle_sku 
  FROM finished_candles 
  WHERE sku LIKE 'LL-%' 
  ORDER BY sku DESC 
  LIMIT 1;
  
  -- Extract numbers
  IF last_vessel_sku IS NOT NULL THEN
    last_vessel_num := CAST(SUBSTRING(last_vessel_sku FROM 4) AS INT);
  END IF;
  
  IF last_candle_sku IS NOT NULL THEN
    last_candle_num := CAST(SUBSTRING(last_candle_sku FROM 4) AS INT);
  END IF;
  
  -- Get the highest number between vessels and candles
  next_number := GREATEST(last_vessel_num, last_candle_num, 99) + 1;
  
  RETURN 'LL-' || next_number::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Update existing candles with SKUs if they don't have one
DO $$
DECLARE
  candle_record RECORD;
  new_sku TEXT;
BEGIN
  FOR candle_record IN 
    SELECT id FROM finished_candles WHERE sku IS NULL OR sku = '' ORDER BY created_at
  LOOP
    new_sku := generate_next_candle_sku();
    UPDATE finished_candles 
    SET sku = new_sku 
    WHERE id = candle_record.id;
  END LOOP;
END $$;
