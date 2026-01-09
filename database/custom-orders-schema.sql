-- ============================================
-- Limen Lakay Custom Orders System
-- ADD-ON Schema for Custom Candle Orders
-- ============================================
-- Run this AFTER the main inventory-tracking-schema.sql
-- This adds the custom order system without touching existing tables

-- ============================================
-- 1. CANDLE VESSELS TABLE
-- Stores available empty vessels for custom orders
-- ============================================
CREATE TABLE IF NOT EXISTS candle_vessels (
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
CREATE INDEX IF NOT EXISTS idx_candle_vessels_available ON candle_vessels(is_available);

-- ============================================
-- 2. CANDLE SCENTS TABLE
-- Stores available scents for custom orders
-- ============================================
CREATE TABLE IF NOT EXISTS candle_scents (
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
CREATE INDEX IF NOT EXISTS idx_candle_scents_available ON candle_scents(is_available);
CREATE INDEX IF NOT EXISTS idx_candle_scents_order ON candle_scents(display_order);

-- ============================================
-- 3. CUSTOM ORDERS TABLE
-- Stores customer orders for custom candles
-- ============================================
CREATE TABLE IF NOT EXISTS custom_orders (
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
CREATE INDEX IF NOT EXISTS idx_custom_orders_order_number ON custom_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_custom_orders_email ON custom_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_custom_orders_status ON custom_orders(status);
CREATE INDEX IF NOT EXISTS idx_custom_orders_created_at ON custom_orders(created_at);

-- ============================================
-- 4. CUSTOM ORDER ITEMS TABLE
-- Links orders to vessels and scents
-- ============================================
CREATE TABLE IF NOT EXISTS custom_order_items (
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
CREATE INDEX IF NOT EXISTS idx_custom_order_items_order_id ON custom_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_custom_order_items_vessel_id ON custom_order_items(vessel_id);
CREATE INDEX IF NOT EXISTS idx_custom_order_items_scent_id ON custom_order_items(scent_id);

-- ============================================
-- TRIGGERS FOR CUSTOM ORDERS
-- ============================================

-- Note: The update_updated_at_column() function should already exist from inventory-tracking-schema.sql

-- Trigger for vessels updated_at
DROP TRIGGER IF EXISTS update_candle_vessels_updated_at ON candle_vessels;
CREATE TRIGGER update_candle_vessels_updated_at
  BEFORE UPDATE ON candle_vessels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for scents updated_at
DROP TRIGGER IF EXISTS update_candle_scents_updated_at ON candle_scents;
CREATE TRIGGER update_candle_scents_updated_at
  BEFORE UPDATE ON candle_scents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for orders updated_at
DROP TRIGGER IF EXISTS update_custom_orders_updated_at ON custom_orders;
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
DROP TRIGGER IF EXISTS update_vessel_stock_after_order ON custom_order_items;
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

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS public_read_vessels ON candle_vessels;
DROP POLICY IF EXISTS public_read_scents ON candle_scents;
DROP POLICY IF EXISTS admin_all_vessels ON candle_vessels;
DROP POLICY IF EXISTS admin_all_scents ON candle_scents;
DROP POLICY IF EXISTS admin_all_custom_orders ON custom_orders;
DROP POLICY IF EXISTS admin_all_custom_order_items ON custom_order_items;
DROP POLICY IF EXISTS public_create_orders ON custom_orders;
DROP POLICY IF EXISTS public_create_order_items ON custom_order_items;

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
-- Only insert if scents don't already exist
INSERT INTO candle_scents (name, name_english, notes, description, display_order) 
SELECT * FROM (VALUES
  ('DOUSÈ LAKAY', 'Sweet Home', 'Black Amber • Sandalwood • Very Vanilla', 'A cozy, comforting scent that feels like a warm hug. Soft vanilla wraps around warm woods and a hint of deep, sweet amber. It''s the perfect candle to light when you want to relax and feel at peace.', 1),
  ('CHIMEN LAKAY', 'Path Home', 'White Oak & Vanilla • Patchouli Amber • Sandalwood', 'This scent smells just like coming home. It''s warm and familiar, like a favorite wooden chair by the fireplace, with a touch of sweet vanilla and earthy warmth. It makes any room feel like home.', 2),
  ('JADEN KREYOL', 'Creole Garden', 'Gardenia • Jasmine • Very Vanilla', 'Close your eyes and imagine walking through a beautiful flower garden. This candle smells like fresh gardenias and sweet jasmine, softened with creamy vanilla. It''s bright, happy, and full of life.', 3),
  ('BÈL SEZON', 'Beautiful Season', 'Mango & Coconut Milk • Sandalwood', 'Sunny and sweet, this candle smells like a tropical vacation. Juicy mango and creamy coconut mix with warm sandalwood to create a scent that feels like summer in a jar.', 4),
  ('LANMOU DOUS', 'Sweet Love', 'Strawberry Cheesecake • Strawberry • Very Vanilla', 'A sweet and happy scent that smells just like your favorite dessert. Think fresh strawberries, rich cheesecake, and smooth vanilla—light this candle to make your space feel sweet and cozy.', 5),
  ('BÈL FLÈ', 'Beautiful Flower', 'Japanese Cherry Blossom • Vanilla Orchid • Sandalwood', 'Soft, pretty, and calming. This candle smells like delicate cherry blossoms and vanilla flowers, with a warm, woody base. It''s perfect for creating a gentle, relaxing atmosphere.', 6),
  ('LAKAY DOUVANJOU', 'Home Before Dawn', 'Palo Santo • White Tea & Ginger • Autum Flannel', 'Fresh, clean, and cozy all at once. This candle clears the air with a spa-like freshness, then wraps you in the soft warmth of a cozy flannel shirt. It''s both uplifting and comforting.', 7),
  ('CHIMEN KACHE', 'Hidden Path', 'Beach Linen • Sandalwood', 'Clean, fresh, and peaceful. This candle smells like crisp laundry drying in the sea breeze, with a touch of warm sandalwood. It brings a calm, clean feeling to any room.', 8)
) AS v(name, name_english, notes, description, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM candle_scents WHERE candle_scents.name = v.name
);

-- ============================================
-- SEED DATA FOR INITIAL VESSELS
-- ============================================
-- Clear existing vessels first (optional - comment out if you want to keep existing)
-- TRUNCATE TABLE candle_vessels CASCADE;

-- Insert vessels directly
DO $$
BEGIN
  -- Yellow Vessel
  IF NOT EXISTS (SELECT 1 FROM candle_vessels WHERE name = 'Yellow Vessel 105') THEN
    INSERT INTO candle_vessels (name, color, size, price, image_url, stock_quantity, is_available, description)
    VALUES ('Yellow Vessel 105', 'Yellow', '105', 39.00, '/images/Yellow empty vessel 105.jpg', 20, true, 'Bright and cheerful yellow vessel');
    RAISE NOTICE 'Inserted Yellow Vessel 105';
  END IF;

  -- Blue Vessel
  IF NOT EXISTS (SELECT 1 FROM candle_vessels WHERE name = 'Blue Vessel 105') THEN
    INSERT INTO candle_vessels (name, color, size, price, image_url, stock_quantity, is_available, description)
    VALUES ('Blue Vessel 105', 'Blue', '105', 39.00, '/images/Blue empty vessel 105.jpg', 20, true, 'Classic blue vessel');
    RAISE NOTICE 'Inserted Blue Vessel 105';
  END IF;

  -- Sky Blue Vessel
  IF NOT EXISTS (SELECT 1 FROM candle_vessels WHERE name = 'Sky Blue Vessel 105') THEN
    INSERT INTO candle_vessels (name, color, size, price, image_url, stock_quantity, is_available, description)
    VALUES ('Sky Blue Vessel 105', 'Sky Blue', '105', 39.00, '/images/sky blue empty vessel 105.jpg', 20, true, 'Light and airy sky blue vessel');
    RAISE NOTICE 'Inserted Sky Blue Vessel 105';
  END IF;

  RAISE NOTICE '✅ Vessel seed data complete. Total vessels: %', (SELECT COUNT(*) FROM candle_vessels);
END $$;

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
-- COMPLETION MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Custom Orders System installed successfully!';
  RAISE NOTICE 'Tables created: candle_vessels, candle_scents, custom_orders, custom_order_items';
  RAISE NOTICE 'Seed data: 8 scents and 3 vessels added';
END $$;
