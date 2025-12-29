-- Workshop Bookings Table
-- This table stores all workshop subscription and booking information

CREATE TABLE IF NOT EXISTS workshop_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  workshop_date TEXT NOT NULL,
  package_type TEXT NOT NULL CHECK (package_type IN ('single', 'monthly', 'premium')),
  package_price DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_id TEXT, -- Store payment processor transaction ID
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_workshop_bookings_email ON workshop_bookings(email);

-- Create index on workshop_date for scheduling queries
CREATE INDEX IF NOT EXISTS idx_workshop_bookings_date ON workshop_bookings(workshop_date);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_workshop_bookings_status ON workshop_bookings(status);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_workshop_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workshop_bookings_updated_at
  BEFORE UPDATE ON workshop_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_workshop_bookings_updated_at();

-- Workshop Schedule Table (Optional: for managing workshop sessions)
CREATE TABLE IF NOT EXISTS workshop_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_date TIMESTAMPTZ NOT NULL,
  max_participants INTEGER DEFAULT 12,
  current_participants INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'full', 'cancelled', 'completed')),
  location TEXT,
  instructor TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on session_date
CREATE INDEX IF NOT EXISTS idx_workshop_sessions_date ON workshop_sessions(session_date);

-- Create index on status
CREATE INDEX IF NOT EXISTS idx_workshop_sessions_status ON workshop_sessions(status);

-- Update timestamp trigger for sessions
CREATE TRIGGER workshop_sessions_updated_at
  BEFORE UPDATE ON workshop_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_workshop_bookings_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE workshop_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workshop_bookings
-- Allow users to read their own bookings
CREATE POLICY "Users can view their own bookings"
  ON workshop_bookings
  FOR SELECT
  USING (auth.jwt() ->> 'email' = email);

-- Allow authenticated users to create bookings
CREATE POLICY "Authenticated users can create bookings"
  ON workshop_bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to update their own bookings (for cancellations)
CREATE POLICY "Users can update their own bookings"
  ON workshop_bookings
  FOR UPDATE
  USING (auth.jwt() ->> 'email' = email);

-- Admin policies (adjust based on your admin setup)
-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings"
  ON workshop_bookings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Admins can update any booking
CREATE POLICY "Admins can update all bookings"
  ON workshop_bookings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- RLS Policies for workshop_sessions
-- Anyone can view open workshop sessions
CREATE POLICY "Anyone can view workshop sessions"
  ON workshop_sessions
  FOR SELECT
  USING (true);

-- Only admins can manage workshop sessions
CREATE POLICY "Admins can manage workshop sessions"
  ON workshop_sessions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Function to update participant count when booking is confirmed
CREATE OR REPLACE FUNCTION update_session_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    UPDATE workshop_sessions
    SET current_participants = current_participants + 1
    WHERE session_date::date = NEW.workshop_date::date;
    
    -- Mark session as full if capacity reached
    UPDATE workshop_sessions
    SET status = 'full'
    WHERE session_date::date = NEW.workshop_date::date
    AND current_participants >= max_participants;
  ELSIF NEW.status = 'cancelled' AND OLD.status = 'confirmed' THEN
    UPDATE workshop_sessions
    SET current_participants = GREATEST(0, current_participants - 1),
        status = 'open'
    WHERE session_date::date = NEW.workshop_date::date;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_participant_count
  AFTER UPDATE ON workshop_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_session_participant_count();

-- Comments for documentation
COMMENT ON TABLE workshop_bookings IS 'Stores all workshop bookings and subscriptions';
COMMENT ON TABLE workshop_sessions IS 'Manages workshop session scheduling and capacity';
COMMENT ON COLUMN workshop_bookings.package_type IS 'Type of package: single, monthly, or premium';
COMMENT ON COLUMN workshop_bookings.status IS 'Booking status: pending, confirmed, cancelled, or completed';
COMMENT ON COLUMN workshop_bookings.payment_status IS 'Payment status: pending, completed, failed, or refunded';
