-- ============================================
-- Limen Lakay Inventory Tracking System
-- Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. TRACKED PRODUCTS TABLE
-- Stores all products with unique tracking IDs
-- ============================================
CREATE TABLE tracked_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  tracking_code TEXT NOT NULL UNIQUE, -- Unique code for QR code URL
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  current_location TEXT DEFAULT 'Warehouse',
  initial_quantity INTEGER DEFAULT 1,
  remaining_quantity INTEGER DEFAULT 1,
  product_type TEXT, -- 'candle', 'vessel', etc.
  size TEXT,
  fragrance TEXT,
  price DECIMAL(10, 2),
  cost DECIMAL(10, 2),
  image_url TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Index for faster lookups
CREATE INDEX idx_tracked_products_sku ON tracked_products(sku);
CREATE INDEX idx_tracked_products_tracking_code ON tracked_products(tracking_code);
CREATE INDEX idx_tracked_products_active ON tracked_products(is_active);

-- ============================================
-- 2. RETAILERS/BOUTIQUES TABLE
-- Stores information about stores carrying products
-- ============================================
CREATE TABLE retailers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  access_code TEXT UNIQUE NOT NULL, -- Unique code for retailer authentication
  commission_rate DECIMAL(5, 2) DEFAULT 30.00, -- Default 30% commission
  payment_terms TEXT, -- 'consignment', 'wholesale', etc.
  contact_person TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  notes TEXT
);

-- Index for faster lookups
CREATE INDEX idx_retailers_access_code ON retailers(access_code);
CREATE INDEX idx_retailers_active ON retailers(is_active);

-- ============================================
-- 3. PRODUCT SCANS TABLE
-- Logs every QR code scan
-- ============================================
CREATE TABLE product_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES tracked_products(id) ON DELETE CASCADE,
  retailer_id UUID REFERENCES retailers(id) ON DELETE SET NULL,
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  scan_type TEXT NOT NULL, -- 'sale', 'inventory_check', 'received', 'returned'
  location TEXT,
  scanned_by TEXT, -- Store/person name
  quantity INTEGER DEFAULT 1,
  sale_price DECIMAL(10, 2),
  notes TEXT,
  ip_address TEXT,
  user_agent TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8)
);

-- Indexes for analytics
CREATE INDEX idx_product_scans_product_id ON product_scans(product_id);
CREATE INDEX idx_product_scans_retailer_id ON product_scans(retailer_id);
CREATE INDEX idx_product_scans_scanned_at ON product_scans(scanned_at);
CREATE INDEX idx_product_scans_scan_type ON product_scans(scan_type);

-- ============================================
-- 4. INVENTORY MOVEMENTS TABLE
-- Tracks product movements between locations
-- ============================================
CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES tracked_products(id) ON DELETE CASCADE,
  retailer_id UUID REFERENCES retailers(id) ON DELETE SET NULL,
  movement_type TEXT NOT NULL, -- 'shipped', 'sold', 'returned', 'transferred', 'damaged'
  quantity INTEGER NOT NULL,
  from_location TEXT,
  to_location TEXT,
  moved_at TIMESTAMPTZ DEFAULT NOW(),
  moved_by TEXT, -- Who initiated the movement
  tracking_number TEXT,
  cost DECIMAL(10, 2),
  notes TEXT
);

-- Indexes for reporting
CREATE INDEX idx_inventory_movements_product_id ON inventory_movements(product_id);
CREATE INDEX idx_inventory_movements_retailer_id ON inventory_movements(retailer_id);
CREATE INDEX idx_inventory_movements_moved_at ON inventory_movements(moved_at);
CREATE INDEX idx_inventory_movements_type ON inventory_movements(movement_type);

-- ============================================
-- 5. INVENTORY SNAPSHOTS TABLE
-- Daily snapshots for historical tracking
-- ============================================
CREATE TABLE inventory_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES tracked_products(id) ON DELETE CASCADE,
  retailer_id UUID REFERENCES retailers(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  quantity INTEGER NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint: one snapshot per product/retailer/date
CREATE UNIQUE INDEX idx_inventory_snapshots_unique 
  ON inventory_snapshots(product_id, retailer_id, snapshot_date);

-- ============================================
-- 6. NOTIFICATIONS TABLE
-- Tracks notifications sent to admin
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type TEXT NOT NULL, -- 'sale', 'low_stock', 'new_scan', 'error'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  product_id UUID REFERENCES tracked_products(id) ON DELETE SET NULL,
  retailer_id UUID REFERENCES retailers(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT false,
  sent_via TEXT[], -- ['email', 'sms', 'dashboard']
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for unread notifications
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for tracked_products
CREATE TRIGGER update_tracked_products_updated_at
  BEFORE UPDATE ON tracked_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update inventory after sale
CREATE OR REPLACE FUNCTION update_inventory_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.scan_type = 'sale' THEN
    UPDATE tracked_products
    SET remaining_quantity = remaining_quantity - COALESCE(NEW.quantity, 1)
    WHERE id = NEW.product_id;
    
    -- Create inventory movement record
    INSERT INTO inventory_movements (
      product_id,
      retailer_id,
      movement_type,
      quantity,
      from_location,
      to_location,
      notes
    ) VALUES (
      NEW.product_id,
      NEW.retailer_id,
      'sold',
      COALESCE(NEW.quantity, 1),
      NEW.location,
      'Customer',
      'Automatic sale record'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic inventory update on sale
CREATE TRIGGER update_inventory_after_sale
  AFTER INSERT ON product_scans
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_on_sale();

-- ============================================
-- VIEWS FOR REPORTING
-- ============================================

-- Current inventory by location
CREATE OR REPLACE VIEW v_inventory_by_location AS
SELECT 
  tp.id,
  tp.product_name,
  tp.sku,
  tp.current_location,
  tp.remaining_quantity,
  r.name as retailer_name,
  r.access_code
FROM tracked_products tp
LEFT JOIN retailers r ON tp.current_location = r.name
WHERE tp.is_active = true;

-- Sales summary by product
CREATE OR REPLACE VIEW v_sales_summary AS
SELECT 
  tp.id as product_id,
  tp.product_name,
  tp.sku,
  COUNT(ps.id) as total_sales,
  SUM(ps.quantity) as units_sold,
  SUM(ps.sale_price) as total_revenue,
  MAX(ps.scanned_at) as last_sale_date
FROM tracked_products tp
LEFT JOIN product_scans ps ON tp.id = ps.product_id AND ps.scan_type = 'sale'
GROUP BY tp.id, tp.product_name, tp.sku;

-- Sales by retailer
CREATE OR REPLACE VIEW v_sales_by_retailer AS
SELECT 
  r.id as retailer_id,
  r.name as retailer_name,
  r.access_code,
  COUNT(ps.id) as total_sales,
  SUM(ps.quantity) as units_sold,
  SUM(ps.sale_price) as total_revenue,
  MAX(ps.scanned_at) as last_sale_date
FROM retailers r
LEFT JOIN product_scans ps ON r.id = ps.retailer_id AND ps.scan_type = 'sale'
GROUP BY r.id, r.name, r.access_code;

-- Low stock alert
CREATE OR REPLACE VIEW v_low_stock_products AS
SELECT 
  id,
  product_name,
  sku,
  current_location,
  remaining_quantity,
  initial_quantity
FROM tracked_products
WHERE remaining_quantity <= 3 AND is_active = true
ORDER BY remaining_quantity ASC;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- Enable RLS for security
-- ============================================

ALTER TABLE tracked_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Admin can do everything
CREATE POLICY admin_all_tracked_products ON tracked_products
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY admin_all_retailers ON retailers
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY admin_all_product_scans ON product_scans
  FOR ALL USING (true); -- Allow anonymous scans

CREATE POLICY admin_all_inventory_movements ON inventory_movements
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY admin_all_notifications ON notifications
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample retailer
INSERT INTO retailers (name, email, phone, address, city, state, access_code, payment_terms)
VALUES 
  ('Boutique Luxe', 'contact@boutiqueluxe.com', '561-234-5678', '123 Main St', 'Miami', 'FL', 'BL-2025-001', 'consignment'),
  ('Artisan Corner', 'hello@artisancorner.com', '561-345-6789', '456 Oak Ave', 'Boca Raton', 'FL', 'AC-2025-002', 'wholesale');

-- Insert sample tracked product
INSERT INTO tracked_products (product_name, sku, tracking_code, product_type, fragrance, price, cost, initial_quantity, remaining_quantity)
VALUES 
  ('Lavender Bliss Candle', 'LAV-001', 'TRK-LAV-001-2025', 'candle', 'Lavender', 32.00, 15.00, 50, 50),
  ('Vanilla Dream Candle', 'VAN-001', 'TRK-VAN-001-2025', 'candle', 'Vanilla', 32.00, 15.00, 40, 40);

-- ============================================
-- NOTES
-- ============================================
-- Run this script in your Supabase SQL Editor
-- Make sure to enable RLS and set up proper authentication
-- Update the policies based on your security requirements
