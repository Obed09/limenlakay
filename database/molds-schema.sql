-- Create molds table for vessel specifications
CREATE TABLE IF NOT EXISTS candle_molds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL, -- e.g., "RIBBED-SM", "SCALLOP-LG"
  shape_type TEXT NOT NULL, -- cylinder, bowl, sphere, scallop
  diameter_inches DECIMAL(4,2) NOT NULL,
  height_inches DECIMAL(4,2) NOT NULL,
  capacity_oz DECIMAL(4,1),
  style_tags TEXT[], -- ["ribbed", "smooth", "fluted", etc.]
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add mold_id to candle_vessels table
ALTER TABLE candle_vessels 
ADD COLUMN IF NOT EXISTS mold_id UUID REFERENCES candle_molds(id),
ADD COLUMN IF NOT EXISTS diameter_inches DECIMAL(4,2),
ADD COLUMN IF NOT EXISTS height_inches DECIMAL(4,2),
ADD COLUMN IF NOT EXISTS capacity_oz DECIMAL(4,1);

-- Enable RLS
ALTER TABLE candle_molds ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Enable read access for all users" ON candle_molds
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON candle_molds
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON candle_molds
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON candle_molds
  FOR DELETE USING (true);

-- Seed molds from your images
INSERT INTO candle_molds (name, code, shape_type, diameter_inches, height_inches, capacity_oz, style_tags, description) VALUES
('Small Ribbed Cylinder', 'RIBBED-SM', 'cylinder', 3.10, 1.40, 4.0, ARRAY['ribbed', 'textured', 'modern'], 'Classic ribbed design with vertical fluted texture'),
('Medium Candle Jar', 'JAR-MD', 'cylinder', 3.70, 3.14, 8.7, ARRAY['smooth', 'classic', 'jar'], 'Standard candle jar with lid option'),
('Large Scalloped Bowl', 'SCALLOP-LG', 'scallop', 6.00, 1.88, 8.0, ARRAY['scalloped', 'decorative', 'flower'], 'Elegant scalloped edge design resembling flower petals'),
('Small Bowl', 'BOWL-SM', 'bowl', 3.25, 2.13, 5.0, ARRAY['smooth', 'bowl', 'rounded'], 'Curved bowl shape with smooth finish'),
('Mini Ribbed (3.22")', 'RIBBED-MINI-A', 'cylinder', 3.22, 3.14, 6.0, ARRAY['ribbed', 'compact', 'textured'], 'Compact ribbed cylinder'),
('Mini Ribbed (3.38")', 'RIBBED-MINI-B', 'cylinder', 3.38, 2.91, 5.5, ARRAY['ribbed', 'compact', 'textured'], 'Slightly wider compact ribbed'),
('Large Ribbed (4.64" tall)', 'RIBBED-LG-A', 'cylinder', 4.64, 2.20, 9.0, ARRAY['ribbed', 'large', 'textured'], 'Large ribbed cylinder - taller version'),
('Large Ribbed (4.64" wide)', 'RIBBED-LG-B', 'cylinder', 4.64, 2.04, 8.5, ARRAY['ribbed', 'large', 'textured'], 'Large ribbed cylinder - wider version'),
('XL Sphere Bowl', 'SPHERE-XL', 'sphere', 8.20, 2.36, 16.0, ARRAY['smooth', 'sphere', 'modern'], 'Extra large spherical bowl design'),
('Medium Bowl (10oz)', 'BOWL-MD-10', 'bowl', 5.43, 2.16, 10.1, ARRAY['smooth', 'bowl', 'rounded'], 'Medium bowl holding 10.1oz of wax');

-- Create index for faster mold lookups
CREATE INDEX IF NOT EXISTS idx_molds_active ON candle_molds(is_active);
CREATE INDEX IF NOT EXISTS idx_molds_shape ON candle_molds(shape_type);
CREATE INDEX IF NOT EXISTS idx_vessels_mold ON candle_vessels(mold_id);
