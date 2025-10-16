-- Limen Lakay Database Schema
-- This file contains the SQL commands to set up your Supabase database

-- Enable Row Level Security
-- Enable the necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table for managing candle inventory
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL, -- 'concrete', 'wood', 'ceramic', 'custom'
  price DECIMAL(10,2),
  is_available BOOLEAN DEFAULT true,
  materials TEXT[], -- Array of materials used
  scents TEXT[], -- Array of available scents
  images TEXT[], -- Array of image URLs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer inquiries and orders
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  order_type VARCHAR(100), -- 'single', 'set', 'custom', 'bulk', 'gift'
  vessel_preference VARCHAR(100), -- 'concrete', 'wood', 'ceramic', 'glass', 'custom'
  scent_preference TEXT,
  quantity VARCHAR(50),
  message TEXT,
  status VARCHAR(50) DEFAULT 'new', -- 'new', 'contacted', 'quoted', 'in_progress', 'completed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletter subscribers (optional)
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Custom orders tracking
CREATE TABLE IF NOT EXISTS custom_orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  inquiry_id UUID REFERENCES inquiries(id),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  order_details JSONB, -- Flexible JSON for order specifications
  quoted_price DECIMAL(10,2),
  deposit_amount DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'quoted', -- 'quoted', 'approved', 'in_production', 'ready', 'delivered'
  estimated_completion DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_orders ENABLE ROW LEVEL SECURITY;

-- Public read access for products
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

-- Allow anyone to insert inquiries (contact form submissions)
CREATE POLICY "Anyone can submit inquiries" ON inquiries
  FOR INSERT WITH CHECK (true);

-- Allow anyone to subscribe to newsletter
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- Insert some sample products
INSERT INTO products (name, description, category, price, materials, scents, is_available) VALUES
('Concrete Vessel - Large', 'Hand-poured soy candle in a minimalist concrete vessel. Each vessel has unique natural variations.', 'concrete', 42.00, '{"Soy Wax", "Concrete Vessel", "Cotton Wick"}', '{"Vanilla Amber", "Cedar & Sage", "Fresh Linen"}', true),
('Concrete Vessel - Medium', 'Perfect size for any room, featuring our signature concrete vessel design.', 'concrete', 35.00, '{"Soy Wax", "Concrete Vessel", "Cotton Wick"}', '{"Vanilla Amber", "Cedar & Sage", "Fresh Linen"}', true),
('Reclaimed Wood Vessel', 'Rustic charm meets modern elegance in this reclaimed wood candle.', 'wood', 28.00, '{"Beeswax Blend", "Reclaimed Wood", "Hemp Wick"}', '{"Sandalwood", "Pine Forest", "Warm Spice"}', true),
('Studio Ceramic - Artisan Glaze', 'Hand-thrown ceramic vessel with unique reactive glazes.', 'ceramic', 45.00, '{"Pure Soy Wax", "Studio Ceramic", "Cotton Wick"}', '{"Lavender Dreams", "Citrus Burst", "Midnight Musk"}', true);

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_orders_updated_at BEFORE UPDATE ON custom_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Helpful views for business management
CREATE VIEW inquiry_summary AS
SELECT 
  DATE(created_at) as inquiry_date,
  COUNT(*) as total_inquiries,
  COUNT(CASE WHEN status = 'new' THEN 1 END) as new_inquiries,
  COUNT(CASE WHEN order_type = 'custom' THEN 1 END) as custom_requests
FROM inquiries 
GROUP BY DATE(created_at)
ORDER BY inquiry_date DESC;