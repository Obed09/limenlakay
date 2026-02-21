-- Create subscriptions table for tracking business subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_service TEXT NOT NULL,
  category TEXT NOT NULL,
  date_paid DATE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  length_of_subscription TEXT NOT NULL,
  expiration_date DATE NOT NULL,
  renewal_date DATE NOT NULL,
  renewal_method TEXT NOT NULL,
  notes TEXT,
  future_platform TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_expiration_date ON subscriptions(expiration_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_category ON subscriptions(category);
CREATE INDEX IF NOT EXISTS idx_subscriptions_renewal_date ON subscriptions(renewal_date);
