-- Workshop Sessions Table for managing workshop schedules with Zoom/Meet links
-- This extends the existing workshop_sessions table with meeting links and email templates

CREATE TABLE IF NOT EXISTS workshop_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_date TIMESTAMPTZ NOT NULL,
  session_time TEXT NOT NULL,
  max_participants INTEGER DEFAULT 12,
  current_participants INTEGER DEFAULT 0,
  meeting_link TEXT, -- Zoom/Meet link
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'full', 'cancelled', 'completed')),
  location TEXT,
  instructor TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Templates Table for customizable workshop emails
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  variables JSONB, -- Store available variables like {name}, {date}, {time}, {link}
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default thank you email template
INSERT INTO email_templates (template_name, subject, body, variables)
VALUES (
  'workshop_confirmation',
  'Your Concrete Creations Workshop Access',
  E'Hi {name},\n\nThank you for subscribing to our workshop! We''re excited to have you.\n\nYour Session: {date} at {time}\nJoin via: {link}\n\nPlease save this link for your selected date/time. We''ll send a reminder before the workshop with preparation details.\n\nSee you soon!\n\nBest,\nLimen Lakay LLC',
  '{"name": "Subscriber name", "date": "Workshop date", "time": "Workshop time", "link": "Meeting link"}'::jsonb
)
ON CONFLICT (template_name) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_workshop_sessions_date ON workshop_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_workshop_sessions_status ON workshop_sessions(status);
CREATE INDEX IF NOT EXISTS idx_email_templates_name ON email_templates(template_name);

-- Enable RLS
ALTER TABLE workshop_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow public read for available sessions
CREATE POLICY "Anyone can view open workshop sessions"
  ON workshop_sessions
  FOR SELECT
  USING (status = 'open');

-- Only admins can modify (you'll need to adjust based on your auth setup)
CREATE POLICY "Service role can manage workshop sessions"
  ON workshop_sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage email templates"
  ON email_templates
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
