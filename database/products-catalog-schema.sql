-- Products Table for Kringle-Style Storefront
-- This stores catalog products displayed in the modern product grid

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2), -- For sale items
  category TEXT NOT NULL, -- 'candles', 'fragrances', 'flameless', 'accessories'
  fragrance TEXT, -- 'holiday', 'autumn', 'florals', 'fresh', 'fruits', 'gourmet'
  size TEXT, -- 'xl-4-wick', 'large-2-wick', 'daylights', 'wax-melts'
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  on_sale BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  rating DECIMAL(2, 1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_fragrance ON products(fragrance);
CREATE INDEX IF NOT EXISTS idx_products_size ON products(size);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_products_on_sale ON products(on_sale);
CREATE INDEX IF NOT EXISTS idx_products_is_new ON products(is_new);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at_trigger
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_products_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read products
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  USING (true);

-- Policy: Only authenticated users can insert products
CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Only authenticated users can update products
CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true);

-- Policy: Only authenticated users can delete products
CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- Insert sample products to match the Kringle style
INSERT INTO products (name, sku, description, price, original_price, category, fragrance, size, image_url, on_sale, is_available, stock_quantity, rating, review_count) VALUES
('Balsam & Cedar Large 2-Wick', 'LL-CAN-001', 'A festive blend of fresh balsam fir and warm cedar wood', 23.25, 31.00, 'candles', 'holiday', 'large-2-wick', 'https://via.placeholder.com/400x400/D97706/FFFFFF?text=Balsam+%26+Cedar', true, true, 50, 5.0, 1),
('Cashmere & Cocoa XL 4-wick', 'LL-CAN-002', 'Luxurious cashmere blended with rich cocoa', 33.75, 45.00, 'candles', 'gourmet', 'xl-4-wick', 'https://via.placeholder.com/400x400/D97706/FFFFFF?text=Cashmere+%26+Cocoa', true, true, 30, 4.5, 64),
('Coffee Shop Large 2 Wick', 'LL-CAN-003', 'Freshly brewed coffee with hints of vanilla and cream', 23.25, 31.00, 'candles', 'gourmet', 'large-2-wick', 'https://via.placeholder.com/400x400/D97706/FFFFFF?text=Coffee+Shop', true, true, 40, 0, 0),
('Cozy Cabin Large 2-wick', 'LL-CAN-004', 'Warm wood smoke with notes of amber and vanilla', 23.25, 31.00, 'candles', 'fresh', 'large-2-wick', 'https://via.placeholder.com/400x400/D97706/FFFFFF?text=Cozy+Cabin', true, true, 45, 4.5, 138);

-- Set the is_new flag on Coffee Shop product
UPDATE products SET is_new = true WHERE sku = 'LL-CAN-003';

COMMENT ON TABLE products IS 'Catalog products for the Kringle-style storefront';
COMMENT ON COLUMN products.category IS 'Product category: candles, fragrances, flameless, accessories';
COMMENT ON COLUMN products.fragrance IS 'Fragrance family: holiday, autumn, florals, fresh, fruits, gourmet';
COMMENT ON COLUMN products.size IS 'Product size: xl-4-wick, large-2-wick, daylights, wax-melts';
COMMENT ON COLUMN products.on_sale IS 'Flag for products currently on sale';
COMMENT ON COLUMN products.is_new IS 'Flag for new products to display NEW badge';
