# Supabase Email Notifications Setup Guide

This guide will help you set up email notifications for your Limen Lakay website using Supabase Edge Functions.

## Prerequisites
- Supabase account with your project set up
- Supabase CLI installed
- Access to your project's database and functions

## Option 1: Using Supabase Edge Functions with Resend (Recommended)

### Step 1: Install Supabase CLI

```powershell
# Install via npm (if you have Node.js)
npm install -g supabase

# Or install via Scoop (Windows package manager)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Step 2: Login to Supabase CLI

```powershell
supabase login
```

This will open a browser for authentication.

### Step 3: Link Your Project

```powershell
# Navigate to your project directory
cd E:\limen-lakay

# Link to your Supabase project
supabase link --project-ref wevgwiuodiknxgzjderd
```

### Step 4: Create the Edge Function

```powershell
# Create a new Edge Function
supabase functions new send-email
```

This creates a folder: `supabase/functions/send-email/index.ts`

### Step 5: Get a Resend API Key

1. Go to [Resend.com](https://resend.com)
2. Sign up for a free account (100 emails/day free tier)
3. Verify your domain OR use their test domain (emails will go to your verified email)
4. Go to "API Keys" and create a new API key
5. Copy the API key (starts with `re_`)

### Step 6: Add Resend API Key to Supabase

```powershell
# Set the secret in Supabase
supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

### Step 7: Update the Edge Function Code

Edit `supabase/functions/send-email/index.ts` with this code:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html } = await req.json()

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Limen Lakay <onboarding@resend.dev>', // Use your verified domain later
        to: [to],
        subject: subject,
        html: html,
      }),
    })

    const data = await res.json()

    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
```

### Step 8: Deploy the Edge Function

```powershell
supabase functions deploy send-email
```

### Step 9: Test the Function

Create a test file `test-email.js`:

```javascript
const SUPABASE_URL = 'https://wevgwiuodiknxgzjderd.supabase.co'
const SUPABASE_ANON_KEY = 'your-anon-key-here'

fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  },
  body: JSON.stringify({
    to: 'info@limenlakay.com',
    subject: 'Test Email from Limen Lakay',
    html: '<h1>Test</h1><p>This is a test email.</p>'
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err))
```

Run: `node test-email.js`

---

## Option 2: Using Supabase Database Triggers + External Email Service

If Edge Functions seem complex, you can use database triggers with a webhook service like Zapier or Make.com:

### Step 1: Create Email Queue Table

Go to Supabase SQL Editor and run:

```sql
CREATE TABLE email_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster queries
CREATE INDEX idx_email_queue_status ON email_queue(status);
```

### Step 2: Modify Your Code

Update `lib/email-notifications.ts` to insert into the queue instead:

```typescript
async function sendEmailNotification(to: string, subject: string, html: string) {
  try {
    const { createClient } = await import('./supabase/client');
    const supabase = createClient();
    
    const { error } = await supabase
      .from('email_queue')
      .insert({
        to_email: to,
        subject: subject,
        html_content: html
      });

    if (error) throw error;
    
    console.log('Email queued successfully');
    return true;
  } catch (error) {
    console.error('Failed to queue email:', error);
    return false;
  }
}
```

### Step 3: Set Up Webhook

1. Go to [Zapier](https://zapier.com) or [Make.com](https://make.com)
2. Create a new automation:
   - Trigger: Supabase - New Row in `email_queue`
   - Action: Gmail/Outlook/SendGrid - Send Email
3. Map the fields (to_email → To, subject → Subject, html_content → Body)
4. Update the row status to 'sent' after sending

---

## Option 3: Simple SMTP with Nodemailer (Development Only)

For quick testing in development:

### Step 1: Install Dependencies

```powershell
npm install nodemailer
```

### Step 2: Create API Route

Create `app/api/send-email/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  const { to, subject, html } = await request.json();

  // Create a test account (or use your Gmail)
  const transporter = nodemailer.createTransporter({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not regular password
    },
  });

  try {
    await transporter.sendMail({
      from: '"Limen Lakay" <your-email@gmail.com>',
      to: to,
      subject: subject,
      html: html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

### Step 3: Update Email Notifications

Update `lib/email-notifications.ts`:

```typescript
async function sendEmailNotification(to: string, subject: string, html: string) {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html })
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}
```

### Step 4: Add Environment Variables

Add to `.env.local`:

```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

To get Gmail App Password:
1. Go to Google Account settings
2. Security → 2-Step Verification
3. App passwords → Generate new app password
4. Select "Mail" and your device
5. Copy the 16-character password

---

## Recommended Approach for Production

**For Limen Lakay, I recommend Option 1 (Supabase Edge Functions + Resend):**

✅ **Pros:**
- Free tier: 100 emails/day (plenty for a small business)
- No credit card required to start
- Easy to scale later
- Hosted on Supabase (no extra infrastructure)
- Professional email deliverability

📝 **Quick Start Checklist:**
1. ✅ Install Supabase CLI: `npm install -g supabase`
2. ✅ Login: `supabase login`
3. ✅ Link project: `supabase link --project-ref wevgwiuodiknxgzjderd`
4. ✅ Create function: `supabase functions new send-email`
5. ✅ Sign up at Resend.com and get API key
6. ✅ Set secret: `supabase secrets set RESEND_API_KEY=re_xxx`
7. ✅ Add function code (see Step 7 above)
8. ✅ Deploy: `supabase functions deploy send-email`
9. ✅ Test with your email

---

## Troubleshooting

### Error: "Supabase CLI not found"
- Make sure Node.js is installed
- Run: `npm install -g supabase`
- Restart terminal after installation

### Error: "Project not linked"
- Run: `supabase link --project-ref wevgwiuodiknxgzjderd`
- Make sure you're logged in: `supabase login`

### Emails not arriving
- Check Resend dashboard for delivery status
- Verify email address is correct
- Check spam folder
- For production, verify your domain in Resend

### CORS errors
- Make sure corsHeaders are included in Edge Function
- Check that SUPABASE_ANON_KEY is set correctly in your app

---

## Next Steps After Setup

1. ✅ Test all forms (Contact, Chat, Feedback)
2. ✅ Verify emails arrive at info@limenlakay.com
3. ✅ Update Resend to use your custom domain (optional)
4. ✅ Monitor email usage in Resend dashboard
5. ✅ Set up email templates for better branding (optional)

---

Need help with any step? Let me know where you get stuck!
