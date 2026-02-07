# UPS Tracking Integration Setup Guide

Complete setup guide for UPS real-time tracking integration with Limen Lakay.

---

## ⚠️ IMPORTANT: Security Notice

**NEVER commit API credentials to Git!** All sensitive information should be stored in:
- `.env.local` (local development - in .gitignore)
- Vercel Environment Variables (production)

---

## ✅ Completed Setup

### 1. Environment Variables Configuration

**You need to add these to Vercel** (DO NOT commit to Git):

```env
# UPS API Configuration (Production)
UPS_CLIENT_ID=your_ups_client_id_here
UPS_CLIENT_SECRET=your_ups_client_secret_here
UPS_ACCOUNT_NUMBER=your_ups_account_number
UPS_API_URL=https://onlinetools.ups.com/api
```

**How to add to Vercel:**
1. Go to: https://vercel.com/obed-s-projects-b2b9199e/limenlakay/settings/environment-variables
2. Add each variable above
3. Set for: Production, Preview, Development
4. Click "Save"
5. Redeploy your site

**How to add locally:**
Add to your `.env.local` file (which is already in .gitignore)

### 2. Getting UPS API Credentials

1. Log in to: https://www.ups.com/upsdeveloperkit
2. Create or select your app
3. Copy your Client ID and Client Secret
4. Copy your UPS Account Number
5. Add to Vercel environment variables (see above)

---

## 🎯 API Endpoints Created

### OAuth Token Endpoint
**URL**: `/api/ups/token`
- Authenticates with UPS API using client credentials
- Returns access token for tracking requests
- Handles token refresh automatically

### Tracking Endpoint
**URL**: `/api/ups/tracking?trackingNumber=XXXXX`
- Fetches real-time tracking data from UPS
- Returns formatted tracking information with history
- Includes delivery estimates and current status

### Shipping Rate Endpoint
**URL**: `/api/ups/shipping-rate`
- Calculates UPS Ground shipping costs
- Returns estimated delivery days
- Fallback to $8.99 if API fails

---

## 📍 Customer Tracking Page

**URL**: `https://www.limenlakay.com/track-order`

Features:
- ✅ Clean, user-friendly interface
- ✅ Real-time UPS tracking lookup
- ✅ Tracking timeline with location history
- ✅ Estimated delivery date display
- ✅ Current shipment status
- ✅ Mobile-responsive design

---

## 🎯 How It Works

### For Customers:

1. **Receive Tracking Number**
   - Customer gets tracking number in shipping confirmation email
   - Tracking link included in email

2. **Track Shipment**
   - Visit: `https://www.limenlakay.com/track-order`
   - Enter UPS tracking number
   - Click "Track" button

3. **View Real-Time Updates**
   - See current status (In Transit, Out for Delivery, Delivered)
   - View tracking timeline with timestamps
   - Check estimated delivery date
   - See location history

### For Admin:

1. **Get Tracking Number from UPS**
   - Create shipment in UPS system
   - Copy tracking number

2. **Add to Order**
   - Go to: `/admin-orders`
   - Find the order
   - Click "Edit"
   - Add tracking number
   - Change status to "Shipped"
   - Save changes

3. **Customer Gets Notified**
   - System automatically sends shipping email
   - Email includes tracking number and link
   - Customer can track in real-time

---

## 📋 Testing

### Test Token Endpoint
```bash
curl https://www.limenlakay.com/api/ups/token
```

Expected response:
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

### Test Tracking Endpoint
```bash
curl "https://www.limenlakay.com/api/ups/tracking?trackingNumber=1Z999AA10123456784"
```

### Test Shipping Rate
```bash
curl -X POST https://www.limenlakay.com/api/ups/shipping-rate \
  -H "Content-Type: application/json" \
  -d '{"toZip":"33101","toState":"FL","toCity":"Miami","weight":2}'
```

---

## 🔧 Integration with Order System

### Auto-Send Tracking Email

When admin marks order as "shipped" with tracking number:
1. Order status updates to "shipped"
2. Email sent to customer automatically
3. Email includes tracking number and link
4. Customer can click to track

**Email Template:**
- Subject: "Your Order Has Shipped! - [ORDER_NUMBER]"
- Includes: UPS tracking number, estimated delivery, tracking link
- Location: `/api/orders/send-email` (type: 'shipped')

---

## 🚨 Troubleshooting

### "Invalid credentials" error
- Verify environment variables are set in Vercel
- Check Client ID and Secret are correct
- Regenerate credentials if needed

### "Tracking not found"
- Verify tracking number format (starts with 1Z or 18+ digits)
- Allow 24 hours after creating shipment
- Check tracking number is entered correctly

### Shipping rate returns fallback
- Verify UPS API credentials
- Check destination ZIP is valid
- Review UPS API logs for errors

---

## 📊 Features

### What's Working:
- ✅ Real-time UPS tracking
- ✅ Dynamic shipping rate calculation
- ✅ Chat widget tracking integration
- ✅ Customer tracking page
- ✅ Automatic shipping emails with tracking
- ✅ OAuth token management
- ✅ Error handling and fallbacks

### Integration Points:
- Checkout page: Dynamic UPS rates
- Custom order page: Weight-based shipping
- Chat widget: UPS tracking tab
- Admin panel: Add tracking numbers
- Email system: Shipping notifications

---

## 🔐 Security Best Practices

1. **Never commit credentials to Git**
   - Use environment variables only
   - Keep `.env.local` in `.gitignore`
   
2. **Use Vercel Secrets**
   - Store all API keys in Vercel
   - Enable for all environments

3. **Regenerate if exposed**
   - If credentials leak, regenerate immediately
   - Update in Vercel only

4. **Monitor API usage**
   - Check UPS Developer portal regularly
   - Set up usage alerts

---

## 📞 Support

**UPS API Issues:**
- UPS Developer Portal: https://www.ups.com/upsdeveloperkit
- UPS Developer Support: developer@ups.com

**Implementation Questions:**
- Check API logs in Vercel
- Review browser console for errors
- Test endpoints with curl

---

**Last Updated:** February 3, 2026  
**Status:** ✅ Fully Operational
