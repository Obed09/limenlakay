-- Fix Invoice RLS Policies
-- This allows both authenticated and anonymous access to invoices

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON invoices;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON invoices;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON invoices;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON invoices;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON invoice_items;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON invoice_items;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON invoice_items;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON invoice_items;

-- Create new policies that allow all authenticated and anon users
-- Invoices policies
CREATE POLICY "Enable all access for all users" ON invoices
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Invoice items policies
CREATE POLICY "Enable all access for all users" ON invoice_items
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Alternatively, if you want to restrict to authenticated users only,
-- make sure users are signed in before accessing /admin-invoices
