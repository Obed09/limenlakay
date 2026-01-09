-- ============================================
-- FINISHED CANDLES TABLE
-- Stores finished candles ready for sale
-- ============================================

CREATE TABLE IF NOT EXISTS finished_candles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES candle_vessels(id) ON DELETE SET NULL,
  scent_id UUID REFERENCES candle_scents(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for finished candles
CREATE INDEX IF NOT EXISTS idx_finished_candles_vessel_id ON finished_candles(vessel_id);
CREATE INDEX IF NOT EXISTS idx_finished_candles_scent_id ON finished_candles(scent_id);
CREATE INDEX IF NOT EXISTS idx_finished_candles_sku ON finished_candles(sku);
CREATE INDEX IF NOT EXISTS idx_finished_candles_available ON finished_candles(is_available);

-- Row Level Security
ALTER TABLE finished_candles ENABLE ROW LEVEL SECURITY;

-- Policies: Anyone can view available candles
CREATE POLICY IF NOT EXISTS public_read_finished_candles ON finished_candles
  FOR SELECT USING (is_available = true);

-- Policies: Admin can manage everything
CREATE POLICY IF NOT EXISTS admin_all_finished_candles ON finished_candles
  FOR ALL USING (auth.role() = 'authenticated');

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_finished_candles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_finished_candles_updated_at
  BEFORE UPDATE ON finished_candles
  FOR EACH ROW
  EXECUTE FUNCTION update_finished_candles_updated_at();

-- Sample finished candles (optional)
INSERT INTO finished_candles (name, vessel_id, scent_id, sku, price, stock_quantity, description)
SELECT 
  v.name || ' - ' || s.name_english,
  v.id,
  s.id,
  'CND-' || LPAD((row_number() OVER ())::text, 3, '0'),
  v.price + 10.00,
  10,
  'Handmade candle combining ' || v.name || ' vessel with ' || s.name_english || ' scent'
FROM 
  candle_vessels v
  CROSS JOIN candle_scents s
WHERE 
  v.is_available = true 
  AND s.is_available = true
LIMIT 3
ON CONFLICT (sku) DO NOTHING;
