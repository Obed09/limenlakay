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
-- 7. CANDLE VESSELS TABLE
-- Stores available empty vessels for custom orders
-- ============================================
CREATE TABLE candle_vessels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  size TEXT NOT NULL, -- e.g., '105'
  price DECIMAL(10, 2) NOT NULL DEFAULT 39.00,
  image_url TEXT NOT NULL, -- Path to vessel image
  is_available BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  description TEXT
);

-- Index for active vessels
CREATE INDEX idx_candle_vessels_available ON candle_vessels(is_available);

-- ============================================
-- 8. CANDLE SCENTS TABLE
-- Stores available scents for custom orders
-- ============================================
CREATE TABLE candle_scents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  name_english TEXT NOT NULL, -- English translation
  notes TEXT NOT NULL, -- Scent notes separated by bullet
  description TEXT NOT NULL, -- Full description
  is_available BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0, -- For ordering in UI
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for available scents
CREATE INDEX idx_candle_scents_available ON candle_scents(is_available);
CREATE INDEX idx_candle_scents_order ON candle_scents(display_order);

-- ============================================
-- 9. CUSTOM ORDERS TABLE
-- Stores customer orders for custom candles
-- ============================================
CREATE TABLE custom_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE, -- e.g., 'ORD-2025-001'
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'shipped', 'completed', 'cancelled'
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'refunded'
  payment_method TEXT, -- 'stripe', 'zelle', etc.
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_zip TEXT,
  tracking_number TEXT,
  notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  shipped_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Indexes for orders
CREATE INDEX idx_custom_orders_order_number ON custom_orders(order_number);
CREATE INDEX idx_custom_orders_email ON custom_orders(customer_email);
CREATE INDEX idx_custom_orders_status ON custom_orders(status);
CREATE INDEX idx_custom_orders_created_at ON custom_orders(created_at);

-- ============================================
-- 10. CUSTOM ORDER ITEMS TABLE
-- Links orders to vessels and scents
-- ============================================
CREATE TABLE custom_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES custom_orders(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES candle_vessels(id) ON DELETE SET NULL,
  scent_id UUID REFERENCES candle_scents(id) ON DELETE SET NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL, -- quantity * unit_price
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for order items
CREATE INDEX idx_custom_order_items_order_id ON custom_order_items(order_id);
CREATE INDEX idx_custom_order_items_vessel_id ON custom_order_items(vessel_id);
CREATE INDEX idx_custom_order_items_scent_id ON custom_order_items(scent_id);

-- ============================================
-- TRIGGERS FOR CUSTOM ORDERS
-- ============================================

-- Trigger for vessels updated_at
CREATE TRIGGER update_candle_vessels_updated_at
  BEFORE UPDATE ON candle_vessels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for scents updated_at
CREATE TRIGGER update_candle_scents_updated_at
  BEFORE UPDATE ON candle_scents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for orders updated_at
CREATE TRIGGER update_custom_orders_updated_at
  BEFORE UPDATE ON custom_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update vessel stock on order
CREATE OR REPLACE FUNCTION update_vessel_stock_on_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Decrease vessel stock when order item is created
  UPDATE candle_vessels
  SET stock_quantity = stock_quantity - NEW.quantity
  WHERE id = NEW.vessel_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic stock update
CREATE TRIGGER update_vessel_stock_after_order
  AFTER INSERT ON custom_order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_vessel_stock_on_order();

-- ============================================
-- ROW LEVEL SECURITY FOR CUSTOM ORDERS
-- ============================================

ALTER TABLE candle_vessels ENABLE ROW LEVEL SECURITY;
ALTER TABLE candle_scents ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_order_items ENABLE ROW LEVEL SECURITY;

-- Policies: Anyone can view available vessels and scents
CREATE POLICY public_read_vessels ON candle_vessels
  FOR SELECT USING (is_available = true);

CREATE POLICY public_read_scents ON candle_scents
  FOR SELECT USING (is_available = true);

-- Policies: Admin can manage everything
CREATE POLICY admin_all_vessels ON candle_vessels
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY admin_all_scents ON candle_scents
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY admin_all_custom_orders ON custom_orders
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY admin_all_custom_order_items ON custom_order_items
  FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Customers can create orders
CREATE POLICY public_create_orders ON custom_orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY public_create_order_items ON custom_order_items
  FOR INSERT WITH CHECK (true);

-- ============================================
-- SEED DATA FOR SCENTS
-- ============================================

INSERT INTO candle_scents (name, name_english, notes, description, display_order) VALUES
('DOUSÈ LAKAY', 'Sweet Home', 'Black Amber • Sandalwood • Very Vanilla', 'A cozy, comforting scent that feels like a warm hug. Soft vanilla wraps around warm woods and a hint of deep, sweet amber. It''s the perfect candle to light when you want to relax and feel at peace.', 1),
('CHIMEN LAKAY', 'Path Home', 'White Oak & Vanilla • Patchouli Amber • Sandalwood', 'This scent smells just like coming home. It''s warm and familiar, like a favorite wooden chair by the fireplace, with a touch of sweet vanilla and earthy warmth. It makes any room feel like home.', 2),
('JADEN KREYOL', 'Creole Garden', 'Gardenia • Jasmine • Very Vanilla', 'Close your eyes and imagine walking through a beautiful flower garden. This candle smells like fresh gardenias and sweet jasmine, softened with creamy vanilla. It''s bright, happy, and full of life.', 3),
('BÈL SEZON', 'Beautiful Season', 'Mango & Coconut Milk • Sandalwood', 'Sunny and sweet, this candle smells like a tropical vacation. Juicy mango and creamy coconut mix with warm sandalwood to create a scent that feels like summer in a jar.', 4),
('LANMOU DOUS', 'Sweet Love', 'Strawberry Cheesecake • Strawberry • Very Vanilla', 'A sweet and happy scent that smells just like your favorite dessert. Think fresh strawberries, rich cheesecake, and smooth vanilla—light this candle to make your space feel sweet and cozy.', 5),
('BÈL FLÈ', 'Beautiful Flower', 'Japanese Cherry Blossom • Vanilla Orchid • Sandalwood', 'Soft, pretty, and calming. This candle smells like delicate cherry blossoms and vanilla flowers, with a warm, woody base. It''s perfect for creating a gentle, relaxing atmosphere.', 6),
('LAKAY DOUVANJOU', 'Home Before Dawn', 'Palo Santo • White Tea & Ginger • Autum Flannel', 'Fresh, clean, and cozy all at once. This candle clears the air with a spa-like freshness, then wraps you in the soft warmth of a cozy flannel shirt. It''s both uplifting and comforting.', 7),
('CHIMEN KACHE', 'Hidden Path', 'Beach Linen • Sandalwood', 'Clean, fresh, and peaceful. This candle smells like crisp laundry drying in the sea breeze, with a touch of warm sandalwood. It brings a calm, clean feeling to any room.', 8);

-- ============================================
-- SEED DATA FOR INITIAL VESSELS
-- ============================================

INSERT INTO candle_vessels (name, color, size, price, image_url, stock_quantity, description) VALUES
('Yellow Vessel 105', 'Yellow', '105', 39.00, '/images/Yellow empty vessel 105.jpg', 20, 'Bright and cheerful yellow vessel'),
('Blue Vessel 105', 'Blue', '105', 39.00, '/images/Blue empty vessel 105.jpg', 20, 'Classic blue vessel'),
('Sky Blue Vessel 105', 'Sky Blue', '105', 39.00, '/images/sky blue empty vessel 105.jpg', 20, 'Light and airy sky blue vessel');

-- ============================================
-- VIEWS FOR CUSTOM ORDERS
-- ============================================

-- Order summary with items
CREATE OR REPLACE VIEW v_order_summary AS
SELECT 
  co.id,
  co.order_number,
  co.customer_name,
  co.customer_email,
  co.total,
  co.status,
  co.payment_status,
  co.created_at,
  COUNT(coi.id) as item_count,
  SUM(coi.quantity) as total_items
FROM custom_orders co
LEFT JOIN custom_order_items coi ON co.id = coi.order_id
GROUP BY co.id, co.order_number, co.customer_name, co.customer_email, co.total, co.status, co.payment_status, co.created_at
ORDER BY co.created_at DESC;

-- Popular scents report
CREATE OR REPLACE VIEW v_popular_scents AS
SELECT 
  cs.id,
  cs.name,
  cs.name_english,
  COUNT(coi.id) as times_ordered,
  SUM(coi.quantity) as total_quantity
FROM candle_scents cs
LEFT JOIN custom_order_items coi ON cs.id = coi.scent_id
GROUP BY cs.id, cs.name, cs.name_english
ORDER BY times_ordered DESC;

-- Popular vessels report
CREATE OR REPLACE VIEW v_popular_vessels AS
SELECT 
  cv.id,
  cv.name,
  cv.color,
  cv.size,
  COUNT(coi.id) as times_ordered,
  SUM(coi.quantity) as total_quantity,
  cv.stock_quantity
FROM candle_vessels cv
LEFT JOIN custom_order_items coi ON cv.id = coi.vessel_id
GROUP BY cv.id, cv.name, cv.color, cv.size, cv.stock_quantity
ORDER BY times_ordered DESC;

-- ============================================
-- NOTES
-- ============================================
-- Run this script in your Supabase SQL Editor
-- Make sure to enable RLS and set up proper authentication
-- Update the policies based on your security requirements
