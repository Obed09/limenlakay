-- Add Stripe payment fields to workshop_bookings table
ALTER TABLE workshop_bookings
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_payment_intent TEXT;

-- Create index on payment_status for filtering
CREATE INDEX IF NOT EXISTS idx_workshop_bookings_payment_status ON workshop_bookings(payment_status);

-- Create index on stripe_session_id for lookups
CREATE INDEX IF NOT EXISTS idx_workshop_bookings_stripe_session ON workshop_bookings(stripe_session_id);
