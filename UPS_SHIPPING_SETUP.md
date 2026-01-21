# UPS Shipping Integration Setup Guide

This guide will walk you through setting up real-time UPS shipping rates for Limen Lakay.

## Prerequisites
- UPS Account (free at ups.com)
- UPS Developer Account (developer.ups.com)
- Your business address (for shipping origin)
- Average package dimensions and weight for your candles

---

## Step 1: Create UPS Developer Account

1. Go to **https://developer.ups.com/**
2. Click **Sign Up** in the top right
3. Fill out the registration form
4. Verify your email address
5. Log in to your new developer account

---

## Step 2: Create an Application

1. Once logged in, click **Apps** in the top menu
2. Click **Create an App**
3. Fill in the application details:
   - **App Name**: `Limen Lakay Shipping`
   - **Description**: `E-commerce shipping rate calculator`
4. Click **Create App**

---

## Step 3: Add Rating API

1. In your app dashboard, find **Products** section
2. Click **Add Products**
3. Search for and select: **Rating** (this provides shipping quotes)
4. Also add: **Address Validation** (optional but recommended)
5. Click **Save**

---

## Step 4: Get API Credentials

1. In your app, go to **Credentials** tab
2. You'll see:
   - **Client ID** (like: `abc123xyz456`)
   - **Client Secret** (like: `def789ghi012`)
3. **IMPORTANT**: Copy these and save them securely

---

## Step 5: Request Production Access

1. In your app, you'll start in **Test/Sandbox Mode**
2. To go live:
   - Click **Request Production Access**
   - UPS will review (usually 1-2 business days)
   - You'll receive an email when approved
3. Once approved, you'll get **Production Credentials**

---

## Step 6: Add Credentials to Vercel

1. Go to your Vercel dashboard: **https://vercel.com**
2. Select your **limenlakay** project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```
UPS_CLIENT_ID=your_client_id_here
UPS_CLIENT_SECRET=your_client_secret_here
UPS_ACCOUNT_NUMBER=your_ups_account_number
UPS_SHIPPER_NUMBER=your_shipper_number (usually same as account)
UPS_ORIGIN_ZIP=33401 (or your actual zip code)
UPS_ORIGIN_CITY=Palm Beach
UPS_ORIGIN_STATE=FL
UPS_ORIGIN_COUNTRY=US
```

5. Set them for **Production**, **Preview**, and **Development**
6. Click **Save**

---

## Step 7: Configure Package Defaults

In your local `.env.local` file, add:

```env
# UPS API Credentials
UPS_CLIENT_ID=your_test_client_id
UPS_CLIENT_SECRET=your_test_client_secret
UPS_ACCOUNT_NUMBER=your_account_number
UPS_SHIPPER_NUMBER=your_shipper_number

# Shipping Origin
UPS_ORIGIN_ZIP=33401
UPS_ORIGIN_CITY=Palm Beach
UPS_ORIGIN_STATE=FL
UPS_ORIGIN_COUNTRY=US

# Default Package Dimensions (in inches)
UPS_DEFAULT_LENGTH=6
UPS_DEFAULT_WIDTH=6
UPS_DEFAULT_HEIGHT=4
UPS_DEFAULT_WEIGHT=2 (in pounds)
```

---

## Step 8: Test the Integration

Once I implement the UPS API code:

1. Go to your checkout page locally
2. Enter a shipping address
3. You should see real UPS rates like:
   - **UPS Ground**: $8.50 (5-7 business days)
   - **UPS 2nd Day Air**: $18.99 (2 business days)
   - **UPS Next Day Air**: $35.50 (1 business day)

---

## Step 9: Go Live Checklist

Before launching with real customers:

- [ ] Production credentials active in Vercel
- [ ] Test with real addresses (your own address, friend's address)
- [ ] Verify rates match UPS website calculator
- [ ] Test with different package weights
- [ ] Confirm origin address is correct
- [ ] Test international shipping if needed

---

## Pricing Structure

UPS charges based on:
1. **Package weight** (heavier = more expensive)
2. **Distance** (origin to destination zip code)
3. **Service level** (Ground vs 2-Day vs Next Day)
4. **Dimensions** (larger boxes cost more)

**Estimated rates for 2lb candle:**
- **UPS Ground** (5-7 days): $7-$12
- **UPS 2nd Day Air**: $15-$25
- **UPS Next Day**: $30-$50

---

## Important Notes

### Free Shipping Threshold
Consider offering free shipping for orders over a certain amount:
- Orders under $50: Customer pays shipping
- Orders $50-$75: Flat $5 shipping
- Orders $75+: FREE shipping

### Package Weight Guidelines
Your standard candle packages:
- Small candle (8oz): ~1.5 lbs with packaging
- Medium candle (12oz): ~2 lbs with packaging
- Large candle (16oz): ~2.5 lbs with packaging
- Multiple candles: Add weights together

### Handling Fee
Many businesses add a $1-2 handling fee to cover:
- Packaging materials
- Labor for packing
- Insurance

---

## Next Steps

Once you complete Steps 1-6 above:

1. **Let me know** and I'll implement the UPS API integration code
2. **Provide** your package dimensions and average weight
3. **Test** with the sandbox credentials first
4. **Go live** once everything looks good

---

## Support Resources

- **UPS Developer Portal**: https://developer.ups.com/
- **UPS Developer Support**: upsdevsupport@ups.com
- **API Documentation**: https://developer.ups.com/api/reference
- **Rate Calculator**: https://www.ups.com/ship/guided/origin

---

## Troubleshooting

**Problem**: "Invalid Access License Number"
- **Solution**: Check that your Client ID and Secret are correct

**Problem**: Rates seem too high
- **Solution**: Verify package weight and dimensions are accurate

**Problem**: "Origin address invalid"
- **Solution**: Confirm your zip code and city/state match

**Problem**: API returns error 401
- **Solution**: Your credentials may be expired or incorrect

---

Let me know when you've completed the UPS Developer setup and I'll implement the integration code!
