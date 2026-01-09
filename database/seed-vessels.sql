-- ============================================
-- MANUAL SEED: Add vessels to the database
-- Run this in Supabase SQL Editor
-- ============================================

-- First, let's check if vessels exist
DO $$
BEGIN
  RAISE NOTICE 'Current vessel count: %', (SELECT COUNT(*) FROM candle_vessels);
END $$;

-- Delete existing vessels if any (optional - comment out if you want to keep existing)
-- DELETE FROM candle_vessels;

-- Insert vessels one by one with check
DO $$
BEGIN
  -- Yellow Vessel
  IF NOT EXISTS (SELECT 1 FROM candle_vessels WHERE name = 'Yellow Vessel 105') THEN
    INSERT INTO candle_vessels (name, color, size, price, image_url, stock_quantity, is_available, description)
    VALUES ('Yellow Vessel 105', 'Yellow', '105', 39.00, '/images/Yellow empty vessel 105.jpg', 20, true, 'Bright and cheerful yellow vessel');
    RAISE NOTICE 'Inserted Yellow Vessel 105';
  ELSE
    RAISE NOTICE 'Yellow Vessel 105 already exists';
  END IF;

  -- Blue Vessel
  IF NOT EXISTS (SELECT 1 FROM candle_vessels WHERE name = 'Blue Vessel 105') THEN
    INSERT INTO candle_vessels (name, color, size, price, image_url, stock_quantity, is_available, description)
    VALUES ('Blue Vessel 105', 'Blue', '105', 39.00, '/images/Blue empty vessel 105.jpg', 20, true, 'Classic blue vessel');
    RAISE NOTICE 'Inserted Blue Vessel 105';
  ELSE
    RAISE NOTICE 'Blue Vessel 105 already exists';
  END IF;

  -- Sky Blue Vessel
  IF NOT EXISTS (SELECT 1 FROM candle_vessels WHERE name = 'Sky Blue Vessel 105') THEN
    INSERT INTO candle_vessels (name, color, size, price, image_url, stock_quantity, is_available, description)
    VALUES ('Sky Blue Vessel 105', 'Sky Blue', '105', 39.00, '/images/sky blue empty vessel 105.jpg', 20, true, 'Light and airy sky blue vessel');
    RAISE NOTICE 'Inserted Sky Blue Vessel 105';
  ELSE
    RAISE NOTICE 'Sky Blue Vessel 105 already exists';
  END IF;
END $$;

-- Verify the insert
DO $$
BEGIN
  RAISE NOTICE '✅ Vessels inserted! Total count: %', (SELECT COUNT(*) FROM candle_vessels);
  RAISE NOTICE 'Available vessels: %', (SELECT COUNT(*) FROM candle_vessels WHERE is_available = true);
END $$;

-- Display all vessels
SELECT 
  name, 
  color, 
  size, 
  price, 
  stock_quantity, 
  is_available,
  created_at
FROM candle_vessels
ORDER BY name;
