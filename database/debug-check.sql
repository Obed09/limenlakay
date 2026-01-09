-- ============================================
-- DEBUG: Check custom orders system setup
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Check if tables exist
SELECT 
  tablename,
  schemaname
FROM pg_tables 
WHERE tablename IN ('candle_vessels', 'candle_scents', 'custom_orders', 'custom_order_items')
ORDER BY tablename;

-- 2. Check vessel count and data
SELECT 
  COUNT(*) as total_vessels,
  SUM(CASE WHEN is_available = true THEN 1 ELSE 0 END) as available_vessels,
  SUM(CASE WHEN stock_quantity > 0 THEN 1 ELSE 0 END) as in_stock_vessels
FROM candle_vessels;

-- 3. List all vessels
SELECT 
  id,
  name, 
  color, 
  size, 
  price, 
  stock_quantity, 
  is_available,
  image_url
FROM candle_vessels
ORDER BY name;

-- 4. Check scents
SELECT 
  COUNT(*) as total_scents,
  SUM(CASE WHEN is_available = true THEN 1 ELSE 0 END) as available_scents
FROM candle_scents;

-- 5. List all scents
SELECT 
  name,
  name_english,
  notes,
  is_available,
  display_order
FROM candle_scents
ORDER BY display_order;

-- 6. Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('candle_vessels', 'candle_scents', 'custom_orders', 'custom_order_items')
ORDER BY tablename, policyname;

-- 7. Test if anonymous users can see vessels (simulates what the app does)
SET ROLE anon;
SELECT COUNT(*) as vessels_visible_to_anon FROM candle_vessels WHERE is_available = true;
RESET ROLE;

-- 8. Check orders
SELECT 
  COUNT(*) as total_orders
FROM custom_orders;
