# SMTP2GO Email Setup Guide for Limen Lakay

SMTP2GO is an excellent choice for sending emails - it's reliable, has a generous free tier (1,000 emails/month), and is easy to set up!

## Step 1: Get Your SMTP2GO Credentials

1. Go to [SMTP2GO.com](https://www.smtp2go.com/)
2. Sign up for a free account
3. After logging in, go to **Settings → Users**
4. Click **Add SMTP User**
5. Give it a name (e.g., "Limen Lakay Website")
6. Copy the credentials:
   - **SMTP Username** (looks like: `limenlakay@smtp2go.com` or similar)
   - **SMTP Password** (auto-generated)
   - **SMTP Server**: `mail.smtp2go.com`
   - **Port**: `2525` (or 587, 8025, 80)

## Step 2: Add SMTP2GO Credentials to Supabase Secrets

Since you already have your Supabase project set up, let's add the SMTP2GO credentials as secrets:

### Option A: Via Supabase Dashboard (Easiest)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/wevgwiuodiknxgzjderd
2. Click on **Settings** (gear icon on left sidebar)
3. Click on **Edge Functions**
4. Scroll to **Function Secrets**
5. Add these secrets:
   - Key: `SMTP_HOST` → Value: `mail.smtp2go.com`
   - Key: `SMTP_PORT` → Value: `2525`
   - Key: `SMTP_USER` → Value: `your-smtp2go-username`
   - Key: `SMTP_PASS` → Value: `your-smtp2go-password`
   - Key: `EMAIL_FROM` → Value: `info@limenlakay.com`

### Option B: Via Supabase CLI

```powershell
supabase secrets set SMTP_HOST=mail.smtp2go.com
supabase secrets set SMTP_PORT=2525
supabase secrets set SMTP_USER=your-smtp2go-username
supabase secrets set SMTP_PASS=your-smtp2go-password
supabase secrets set EMAIL_FROM=info@limenlakay.com
```

## Step 3: Create Supabase Edge Function

### 3.1: Create the function directory

```powershell
cd E:\limen-lakay
mkdir -p supabase\functions\send-email
```

### 3.2: Create the function file

Create `supabase/functions/send-email/index.ts` with this code:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts"

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

    // Get SMTP credentials from environment
    const SMTP_HOST = Deno.env.get('SMTP_HOST') || 'mail.smtp2go.com'
    const SMTP_PORT = parseInt(Deno.env.get('SMTP_PORT') || '2525')
    const SMTP_USER = Deno.env.get('SMTP_USER')
    const SMTP_PASS = Deno.env.get('SMTP_PASS')
    const EMAIL_FROM = Deno.env.get('EMAIL_FROM') || 'info@limenlakay.com'

    if (!SMTP_USER || !SMTP_PASS) {
      throw new Error('SMTP credentials not configured')
    }

    // Create SMTP client
    const client = new SMTPClient({
      connection: {
        hostname: SMTP_HOST,
        port: SMTP_PORT,
        tls: false,
        auth: {
          username: SMTP_USER,
          password: SMTP_PASS,
        },
      },
    })

    // Send email
    await client.send({
      from: EMAIL_FROM,
      to: to,
      subject: subject,
      content: html,
      html: html,
    })

    await client.close()

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Email error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
```

## Step 4: Deploy the Edge Function

```powershell
# Make sure you're logged in
supabase login

# Link your project (if not already linked)
supabase link --project-ref wevgwiuodiknxgzjderd

# Deploy the function
supabase functions deploy send-email
```

## Step 5: Verify Your Domain in SMTP2GO (Important!)

To send emails from `info@limenlakay.com`, you need to verify your domain:

1. Go to SMTP2GO Dashboard → **Settings → Sending Domains**
2. Click **Add Domain**
3. Enter `limenlakay.com`
4. SMTP2GO will give you DNS records (SPF, DKIM, DMARC)
5. Add these DNS records to your domain registrar:
   - Go to where you bought your domain (GoDaddy, Namecheap, etc.)
   - Add the TXT records SMTP2GO provides
   - Wait 10-30 minutes for DNS to propagate
6. Return to SMTP2GO and click **Verify**

### Temporary Option (For Testing)

Until your domain is verified, you can use a verified email address:
- Change `EMAIL_FROM` to your personal email (e.g., `yourname@gmail.com`)
- SMTP2GO allows this for testing

## Step 6: Test the Email Function

Create a test file `test-smtp2go.html`:

```html
<!DOCTYPE html>
<html>
<body>
  <h1>Test SMTP2GO Email</h1>
  <button onclick="sendTestEmail()">Send Test Email</button>
  <div id="result"></div>

  <script>
    async function sendTestEmail() {
      const result = document.getElementById('result');
      result.textContent = 'Sending...';

      try {
        const response = await fetch('https://wevgwiuodiknxgzjderd.supabase.co/functions/v1/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_SUPABASE_ANON_KEY'
          },
          body: JSON.stringify({
            to: 'info@limenlakay.com',
            subject: 'Test Email from Limen Lakay',
            html: '<h1>Hello!</h1><p>This is a test email from your website.</p>'
          })
        });

        const data = await response.json();
        result.textContent = JSON.stringify(data, null, 2);
      } catch (error) {
        result.textContent = 'Error: ' + error.message;
      }
    }
  </script>
</body>
</html>
```

Replace `YOUR_SUPABASE_ANON_KEY` with your actual anon key, then open the file in a browser and click the button.

## Step 7: Your Email Notifications Are Ready!

Your existing code in `lib/email-notifications.ts` is already set up correctly! It will now use the SMTP2GO Edge Function to send emails.

All your forms will automatically send notifications to `info@limenlakay.com`:
- ✅ Contact inquiries
- ✅ Chat messages
- ✅ Customer feedback
- ✅ Order tracking requests

## Troubleshooting

### "SMTP credentials not configured"
- Make sure you added the secrets in Supabase Dashboard
- Redeploy the function: `supabase functions deploy send-email`

### "Authentication failed"
- Double-check SMTP username and password from SMTP2GO
- Make sure you copied them exactly (no extra spaces)

### Emails not arriving
- Check SMTP2GO Dashboard → **Activity** to see if emails were sent
- Check spam folder
- Verify your domain in SMTP2GO for better deliverability
- Make sure `EMAIL_FROM` matches your verified domain

### CORS errors
- The function includes CORS headers by default
- Make sure you're using the correct Supabase URL and anon key

## SMTP2GO Free Tier Limits

✅ **1,000 emails per month** (more than enough for a small business)
✅ **Unlimited** sending domains
✅ **24/7 support**

If you grow beyond 1,000 emails/month, their paid plans are very affordable.

## Monitoring Your Emails

1. Go to SMTP2GO Dashboard
2. Click on **Activity** to see all sent emails
3. Check delivery status, bounces, and opens
4. View detailed logs for debugging

---

## Quick Commands Reference

```powershell
# Login to Supabase
supabase login

# Link project
supabase link --project-ref wevgwiuodiknxgzjderd

# Create function directory
mkdir -p supabase\functions\send-email

# Deploy function
supabase functions deploy send-email

# View function logs
supabase functions logs send-email

# Set secrets via CLI (optional)
supabase secrets set SMTP_HOST=mail.smtp2go.com
supabase secrets set SMTP_PORT=2525
supabase secrets set SMTP_USER=your-username
supabase secrets set SMTP_PASS=your-password
```

---

Let me know when you have your SMTP2GO credentials and I'll help you with the next steps!
