-- ============================================
-- FIX RLS POLICIES for Anonymous Access
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop and recreate policies to allow anonymous access

-- 1. Fix candle_vessels policies
DROP POLICY IF EXISTS public_read_vessels ON candle_vessels;
DROP POLICY IF EXISTS admin_all_vessels ON candle_vessels;

-- Allow ANYONE (including anonymous) to read available vessels
CREATE POLICY "Allow public read access to available vessels"
ON candle_vessels FOR SELECT
TO public
USING (is_available = true);

-- Allow authenticated users to do everything
CREATE POLICY "Allow authenticated users full access to vessels"
ON candle_vessels FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 2. Fix candle_scents policies
DROP POLICY IF EXISTS public_read_scents ON candle_scents;
DROP POLICY IF EXISTS admin_all_scents ON candle_scents;

-- Allow ANYONE (including anonymous) to read available scents
CREATE POLICY "Allow public read access to available scents"
ON candle_scents FOR SELECT
TO public
USING (is_available = true);

-- Allow authenticated users to do everything
CREATE POLICY "Allow authenticated users full access to scents"
ON candle_scents FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. Fix custom_orders policies
DROP POLICY IF EXISTS public_create_orders ON custom_orders;
DROP POLICY IF EXISTS admin_all_custom_orders ON custom_orders;

-- Allow ANYONE to create orders
CREATE POLICY "Allow public to create orders"
ON custom_orders FOR INSERT
TO public
WITH CHECK (true);

-- Allow authenticated users full access
CREATE POLICY "Allow authenticated users full access to orders"
ON custom_orders FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Fix custom_order_items policies
DROP POLICY IF EXISTS public_create_order_items ON custom_order_items;
DROP POLICY IF EXISTS admin_all_custom_order_items ON custom_order_items;

-- Allow ANYONE to create order items
CREATE POLICY "Allow public to create order items"
ON custom_order_items FOR INSERT
TO public
WITH CHECK (true);

-- Allow authenticated users full access
CREATE POLICY "Allow authenticated users full access to order items"
ON custom_order_items FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Verify policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('candle_vessels', 'candle_scents', 'custom_orders', 'custom_order_items')
ORDER BY tablename, policyname;
