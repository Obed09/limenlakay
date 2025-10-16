-- Chat Widget Database Extensions
-- Add these tables to your existing Supabase database

-- Chat messages for customer support
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  sender_type VARCHAR(20) NOT NULL, -- 'customer' or 'support'
  sender_name VARCHAR(255),
  sender_email VARCHAR(255),
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer feedback and reviews
CREATE TABLE IF NOT EXISTS customer_feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  order_reference VARCHAR(100),
  is_featured BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order tracking information
CREATE TABLE IF NOT EXISTS order_tracking (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tracking_number VARCHAR(100) UNIQUE NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  order_status VARCHAR(50) DEFAULT 'received', -- 'received', 'in_production', 'quality_check', 'ready', 'shipped', 'delivered'
  product_details JSONB,
  estimated_completion DATE,
  actual_completion DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order status history for detailed tracking
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tracking_number VARCHAR(100) REFERENCES order_tracking(tracking_number),
  status VARCHAR(50) NOT NULL,
  status_message TEXT,
  updated_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Policies for chat messages
CREATE POLICY "Anyone can insert chat messages" ON chat_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Support can view all chat messages" ON chat_messages
  FOR SELECT USING (true); -- You'll want to restrict this to authenticated support users

-- Policies for feedback
CREATE POLICY "Anyone can submit feedback" ON customer_feedback
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Approved feedback is viewable by everyone" ON customer_feedback
  FOR SELECT USING (is_approved = true);

-- Policies for order tracking
CREATE POLICY "Customers can view their own orders" ON order_tracking
  FOR SELECT USING (true); -- For now, allow all - you can restrict by email later

-- Insert sample tracking data
INSERT INTO order_tracking (tracking_number, customer_email, customer_name, order_status, product_details, estimated_completion) VALUES
('LL-2024-001', 'customer@example.com', 'John Doe', 'in_production', '{"product": "Concrete Vessel - Large", "scent": "Vanilla Amber", "quantity": 1}', CURRENT_DATE + INTERVAL '5 days'),
('LL-2024-002', 'jane@example.com', 'Jane Smith', 'quality_check', '{"product": "Custom Creation", "vessel": "Reclaimed Wood", "scent": "Cedar & Sage", "quantity": 2}', CURRENT_DATE + INTERVAL '3 days'),
('LL-2024-003', 'mike@example.com', 'Mike Johnson', 'ready', '{"product": "Ceramic Studio Collection", "scent": "Lavender Dreams", "quantity": 1}', CURRENT_DATE);

-- Insert sample status history
INSERT INTO order_status_history (tracking_number, status, status_message) VALUES
('LL-2024-001', 'received', 'Order received and confirmed'),
('LL-2024-001', 'in_production', 'Candle is being hand-crafted'),
('LL-2024-002', 'received', 'Custom order received'),
('LL-2024-002', 'in_production', 'Creating custom wooden vessel'),
('LL-2024-002', 'quality_check', 'Final quality inspection in progress'),
('LL-2024-003', 'received', 'Order received'),
('LL-2024-003', 'in_production', 'Ceramic vessel being prepared'),
('LL-2024-003', 'quality_check', 'Quality check completed'),
('LL-2024-003', 'ready', 'Order ready for pickup/shipping');

-- Sample approved feedback
INSERT INTO customer_feedback (customer_name, customer_email, rating, comment, is_approved, is_featured) VALUES
('Sarah Williams', 'sarah@example.com', 5, 'Absolutely love my concrete vessel candle! The craftsmanship is incredible and the scent is perfect for my living room.', true, true),
('David Chen', 'david@example.com', 5, 'The custom wooden candle exceeded my expectations. Beautiful work and amazing customer service!', true, true),
('Emily Rodriguez', 'emily@example.com', 4, 'Great quality candles. The ceramic vessel is stunning and the candle burns evenly.', true, false),
('Tom Anderson', 'tom@example.com', 5, 'Best handmade candles I have ever purchased. Will definitely order again!', true, true);

-- Create view for order tracking with latest status
CREATE VIEW order_tracking_with_status AS
SELECT 
  ot.*,
  osh.status_message,
  osh.created_at as last_status_update
FROM order_tracking ot
LEFT JOIN order_status_history osh ON ot.tracking_number = osh.tracking_number
WHERE osh.created_at = (
  SELECT MAX(created_at) 
  FROM order_status_history 
  WHERE tracking_number = ot.tracking_number
);

-- Update trigger for order_tracking
CREATE TRIGGER update_order_tracking_updated_at 
  BEFORE UPDATE ON order_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();