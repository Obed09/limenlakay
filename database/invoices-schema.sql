-- Invoices Schema
-- This creates the database structure for the invoice management system

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_address TEXT,
  customer_phone TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 7.0,
  tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  notes TEXT,
  terms TEXT,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create invoice items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  rate DECIMAL(10, 2) NOT NULL DEFAULT 0,
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_customer_email ON invoices(customer_email);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- Enable Row Level Security
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoices
CREATE POLICY "Enable read access for authenticated users" ON invoices
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users" ON invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON invoices
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Enable delete for authenticated users" ON invoices
  FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for invoice_items
CREATE POLICY "Enable read access for authenticated users" ON invoice_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users" ON invoice_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON invoice_items
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Enable delete for authenticated users" ON invoice_items
  FOR DELETE
  TO authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically update overdue status
CREATE OR REPLACE FUNCTION update_overdue_invoices()
RETURNS void AS $$
BEGIN
  UPDATE invoices
  SET status = 'overdue'
  WHERE due_date < CURRENT_DATE
    AND status IN ('sent', 'draft')
    AND status != 'paid'
    AND status != 'cancelled';
END;
$$ LANGUAGE plpgsql;

-- You can run this function periodically or set up a cron job
-- SELECT update_overdue_invoices();

-- Insert sample invoice for testing
INSERT INTO invoices (
  invoice_number,
  customer_name,
  customer_email,
  date,
  due_date,
  subtotal,
  tax_rate,
  tax_amount,
  discount_percentage,
  discount_amount,
  total,
  status,
  notes,
  terms
) VALUES (
  'INV-10',
  'Stefanie',
  'stefanie@example.com',
  '2026-01-13',
  '2026-01-13',
  60.00,
  7.0,
  4.20,
  0,
  0,
  64.20,
  'sent',
  'Please send payment via Zelle to the following email address:
LIMENLAKAYLLC@GMAIL.COM',
  'Payment Due: Payment is required within 7 days of the invoice date unless otherwise agreed.

Late Fees: Unpaid balances incur a 2% late fee per week after the due date.

Payment Methods: We accept bank transfer, debit/credit card, or approved digital payment platforms.

Delivery Schedule: Work or deliverables will be provided according to the agreed project timeline.'
) RETURNING id;

-- Get the last inserted invoice ID and insert items
WITH last_invoice AS (
  SELECT id FROM invoices WHERE invoice_number = 'INV-10' LIMIT 1
)
INSERT INTO invoice_items (
  invoice_id,
  description,
  quantity,
  rate,
  amount
) SELECT 
  id,
  'Jaden Kreyol - Candle',
  1,
  60.00,
  60.00
FROM last_invoice;

-- Grant necessary permissions
GRANT ALL ON invoices TO authenticated;
GRANT ALL ON invoice_items TO authenticated;
