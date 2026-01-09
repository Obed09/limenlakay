# Stripe Payment Setup Guide for Workshop Bookings

## Step 1: Get Your Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Sign up or log in to your account
3. Click on **Developers** → **API keys**
4. Copy your **Publishable key** and **Secret key**

## Step 2: Add Environment Variables

Add these to your `.env.local` file:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_...your_webhook_secret_here

# Site URL (for redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Step 3: Update Database

Run the SQL migration to add Stripe fields:

```sql
-- Run this in Supabase SQL Editor
ALTER TABLE workshop_bookings
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_payment_intent TEXT;

CREATE INDEX IF NOT EXISTS idx_workshop_bookings_payment_status ON workshop_bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_workshop_bookings_stripe_session ON workshop_bookings(stripe_session_id);
```

## Step 4: Set Up Stripe Webhook (for Production)

### For Local Testing:
1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run: `stripe login`
3. Forward events to local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe-webhook
   ```
4. Copy the webhook signing secret (starts with `whsec_`) and add it to `.env.local`

### For Production:
1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL: `https://yourdomain.com/api/stripe-webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Signing secret** and add to production environment variables

## Step 5: Test the Integration

1. Start your development server: `npm run dev`
2. Go to: http://localhost:3000/workshop-subscription
3. Fill out the booking form
4. Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVV
5. Complete the payment
6. Check that:
   - You're redirected to success page
   - Booking is saved in database with `payment_status: 'paid'`
   - Confirmation email is sent

## Stripe Test Cards

| Card Number | Description |
|------------|-------------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 9995 | Declined |
| 4000 0025 0000 3155 | Requires authentication |

## How It Works

1. **User fills form** → Workshop details collected
2. **Click "Proceed to Checkout"** → Creates Stripe Checkout Session
3. **Redirects to Stripe** → User enters payment details on Stripe's secure page
4. **Payment successful** → Webhook receives event
5. **Webhook saves booking** → Data stored in Supabase with payment confirmation
6. **Send email** → Confirmation sent to customer
7. **Redirect to success page** → User sees confirmation

## Files Created

- `/app/api/create-checkout-session/route.ts` - Creates Stripe checkout
- `/app/api/stripe-webhook/route.ts` - Handles payment webhooks
- `/app/workshop-subscription/success/page.tsx` - Success page
- `/app/workshop-subscription/page.tsx` - Updated booking form
- `/database/add-stripe-fields.sql` - Database migration

## Troubleshooting

### Webhook not receiving events
- Make sure Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/stripe-webhook`
- Check webhook secret is correct in `.env.local`
- Verify endpoint is accessible

### Payment succeeds but booking not saved
- Check webhook logs in terminal
- Verify Supabase RLS policies allow inserts
- Check database connection

### Redirect not working
- Verify `NEXT_PUBLIC_SITE_URL` is set correctly
- Check success/cancel URLs in checkout session

## Production Checklist

- [ ] Switch to live Stripe keys (not test keys)
- [ ] Set up production webhook endpoint
- [ ] Update `NEXT_PUBLIC_SITE_URL` to production domain
- [ ] Test with real card (or use test mode in production initially)
- [ ] Set up email notifications
- [ ] Monitor Stripe Dashboard for transactions
- [ ] Set up error tracking (Sentry, LogRocket, etc.)

## Support

- Stripe Docs: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
