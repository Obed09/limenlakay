# Order Email Notifications System

Complete automated email system for customer order communications.

---

## 📧 Email Types

### 1. Order Confirmation Email
**Sent:** Immediately after order is placed  
**Trigger:** Customer submits order via custom-order page or completes Stripe checkout  
**Contains:**
- Order number
- Order total
- Shipping address
- List of items ordered
- What to expect next (crafting → quality check → shipping → delivery)
- Contact information

### 2. Shipping Notification Email
**Sent:** When admin marks order as "shipped" and adds tracking number  
**Trigger:** Admin updates order status to "shipped" in admin panel  
**Contains:**
- UPS tracking number (clickable link to your tracking page)
- Estimated delivery time (3-5 business days)
- Shipping address
- Link to track on your site: https://www.limenlakay.com/track-order
- Instructions to use chat widget for tracking

### 3. Order Status Update Email
**Sent:** When admin manually wants to notify customer  
**Trigger:** Manual API call (can be added to admin panel)  
**Contains:**
- Current order status
- Custom message
- Additional notes
- Contact information

---

## 🔧 How It Works

### Architecture

```
Customer Action
     ↓
Order Created (custom_orders table)
     ↓
API: /api/orders/send-email (POST)
     ↓
Supabase Edge Function: send-email
     ↓
SMTP2GO Service
     ↓
Customer Inbox ✅
```

### Email Endpoint

**Location:** `app/api/orders/send-email/route.ts`

**Usage:**
```typescript
await fetch('/api/orders/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'customer@email.com',
    type: 'confirmation', // or 'shipped', 'status_update'
    orderNumber: 'ORD-1234567890',
    customerName: 'John Doe',
    total: 45.99,
    shippingAddress: '123 Main St, Miami, FL 33101',
    trackingNumber: '1Z999AA10123456784', // For 'shipped' type
    orderDetails: '<div>2x Lavender Candle - $22.00</div>', // HTML
  }),
});
```

---

## ✅ Current Implementation Status

### ✅ Active & Working

1. **Custom Order Confirmations**
   - File: `app/api/custom-orders/route.ts` (lines 140-156)
   - Sends email immediately after order creation
   - Includes full order details

2. **Shipping Notifications**
   - File: `app/api/custom-orders/route.ts` (PATCH handler, lines 217-235)
   - Automatically sends when:
     - Admin changes status to "shipped"
     - Tracking number exists in order
   - Includes UPS tracking number and delivery estimate

3. **Workshop Bookings**
   - File: `app/api/stripe-webhook/route.ts`
   - File: `app/api/workshop-booking/send-email/route.ts`
   - Sends confirmation for workshop subscriptions

4. **Stripe Payment Confirmations**
   - File: `app/api/stripe-webhook/route.ts` (lines 62-83)
   - Sends confirmation for both workshops and product purchases

### 🔧 Email Service Configuration

**Provider:** SMTP2GO (via Supabase Edge Function)

**Environment Variables Required:**
- `SMTP2GO_API_KEY` - In Supabase secrets
- `EMAIL_FROM` - Default: info@limenlakay.com
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public API key

**Edge Function Location:** `supabase/functions/send-email/index.ts`

---

## 📋 Testing the Email System

### Test 1: Order Confirmation Email

1. Go to: https://www.limenlakay.com/custom-order
2. Select a vessel and scent
3. Add to cart
4. Go to checkout (Step 3)
5. Fill in customer info with **YOUR email**
6. Click "Submit Order"
7. **Expected:** Email arrives within 1-2 minutes

### Test 2: Shipping Notification Email

1. Go to admin panel: https://www.limenlakay.com/admin-orders
2. Find a test order
3. Click "Edit" on the order
4. Add a tracking number (e.g., `1Z999AA10123456784`)
5. Change status to "Shipped"
6. Click "Update Order"
7. **Expected:** Customer receives shipping email with tracking link

### Test 3: Workshop Confirmation Email

1. Go to: https://www.limenlakay.com/workshop-subscription
2. Select a session date
3. Fill in details with **YOUR email**
4. Complete Stripe payment (test mode)
5. **Expected:** Workshop confirmation email arrives

---

## 🚨 Troubleshooting

### Emails Not Sending

**Check 1: Supabase Edge Function**
```powershell
# View Edge Function logs
supabase functions logs send-email --project-ref wevgwiuodiknxgzjderd
```

**Check 2: SMTP2GO API Key**
1. Go to Supabase Dashboard
2. Settings → Edge Functions → Function Secrets
3. Verify `SMTP2GO_API_KEY` exists
4. Check SMTP2GO dashboard for email delivery logs

**Check 3: Email Preview**
If email fails, API returns preview in response:
```json
{
  "success": false,
  "error": "Email service temporarily unavailable",
  "preview": {
    "to": "customer@email.com",
    "subject": "Order Confirmation - ORD-123"
  }
}
```

### Email Goes to Spam

**Solutions:**
1. Add SPF record to your domain
2. Verify sender email in SMTP2GO
3. Add DKIM signature (SMTP2GO does this automatically)
4. Ask customers to whitelist `info@limenlakay.com`

### Tracking Link Not Working

1. Verify tracking number format (UPS: starts with `1Z` or 18+ digits)
2. Test link: https://www.limenlakay.com/track-order
3. Check UPS API credentials in environment variables

---

## 📊 Email Templates

All templates use professional HTML with:
- Responsive design (mobile-friendly)
- Limen Lakay branding (amber/orange colors)
- Clear call-to-action buttons
- Contact information
- Professional footer

**Template Location:** `app/api/orders/send-email/route.ts`

**Colors:**
- Primary: `#d97706` (Amber 600)
- Secondary: `#ea580c` (Orange 600)
- Success: `#10b981` (Green 500)
- Info: `#3b82f6` (Blue 500)

---

## 🔮 Future Enhancements

### Planned Features

1. **Order Status Change Emails**
   - Notify when order moves from pending → processing
   - Notify when order is completed

2. **Delay/Issue Notifications**
   - Email customer if order is delayed
   - Notify about any fulfillment issues

3. **Email Preferences**
   - Let customers opt-in/out of marketing emails
   - Transactional emails always sent

4. **Email Templates in Database**
   - Store templates in `email_templates` table
   - Allow admin to customize via dashboard

5. **Delivery Confirmation**
   - Webhook from UPS when delivered
   - Send "Your order was delivered" email

---

## 🛠️ Admin Panel Integration

### Add Manual Email Button

To add a "Send Email" button in admin panel:

```tsx
<Button 
  onClick={async () => {
    await fetch('/api/orders/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: order.customer_email,
        type: 'status_update',
        orderNumber: order.order_number,
        customerName: order.customer_name,
        statusDetails: {
          status: 'In Progress',
          message: 'Your candles are being crafted!',
        },
      }),
    });
  }}
>
  Send Status Email
</Button>
```

---

## 📞 Support Contact

**Email Issues:**
- Business Email: info@limenlakay.com
- Phone: (561) 593-0238

**Technical Issues:**
- Check Supabase Edge Function logs
- Check SMTP2GO dashboard: https://www.smtp2go.com
- Verify environment variables

---

## ✅ Email Checklist

After deployment, verify:

- [ ] Order confirmation emails sent immediately after order
- [ ] Shipping emails sent when status changed to "shipped"
- [ ] Tracking links work in emails
- [ ] Emails not going to spam
- [ ] Mobile-friendly email layout
- [ ] All links in emails work
- [ ] Contact information correct
- [ ] Workshop confirmation emails working
- [ ] Stripe payment confirmation emails working
- [ ] SMTP2GO API key valid

---

**Last Updated:** February 2, 2026  
**System Status:** ✅ Fully Operational
