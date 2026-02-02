# Address Autocomplete Setup Guide

Enhance your checkout experience with smart address autocomplete powered by Google Places API.

---

## 🎯 Features

### ✅ What's Included

1. **Address Autocomplete**
   - Start typing and get instant address suggestions
   - Powered by Google Places API
   - US addresses only (for shipping)
   - Auto-fills street, city, state, and ZIP

2. **State Dropdown**
   - All 50 US states + DC
   - Clean dropdown interface
   - No typing errors

3. **Smart Shipping Calculation**
   - Automatically calculates UPS shipping when ZIP entered
   - Works with or without Google API

4. **Fallback Support**
   - Works without Google API (manual entry)
   - State dropdown always works
   - No errors if API not configured

---

## 🔧 Setup Instructions

### Option 1: With Google Places API (Recommended)

**Step 1: Get Google Maps API Key**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Places API**:
   - APIs & Services → Library
   - Search for "Places API"
   - Click "Enable"
4. Create credentials:
   - APIs & Services → Credentials
   - Click "Create Credentials" → "API Key"
   - Copy your API key

**Step 2: Restrict Your API Key (Important for Security)**

1. Click on your API key
2. Under "API restrictions":
   - Select "Restrict key"
   - Check only "Places API"
3. Under "Application restrictions":
   - Select "HTTP referrers"
   - Add: `*.vercel.app/*`
   - Add: `www.limenlakay.com/*`
   - Add: `localhost:3000/*` (for development)
4. Click "Save"

**Step 3: Add to Environment Variables**

Add to `.env.local`:
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...your_key_here
```

Add to Vercel:
1. Go to: https://vercel.com/obed-s-projects-b2b9199e/limenlakay/settings/environment-variables
2. Add new variable:
   - Name: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - Value: Your API key
   - Environment: Production, Preview, Development
3. Click "Save"
4. Redeploy your site

**Step 4: Test**

1. Go to checkout or custom order page
2. Start typing an address
3. You should see autocomplete suggestions appear
4. Select an address - city, state, ZIP auto-fill

---

### Option 2: Without Google API (Manual Entry)

If you don't want to use Google API, the system works perfectly fine with manual entry:

✅ **What Still Works:**
- State dropdown (all 50 states)
- Manual city/ZIP entry
- UPS shipping calculation
- Full checkout process

❌ **What You Won't Have:**
- Address autocomplete suggestions
- Auto-fill from Google

**No setup needed** - just skip the Google API key and it works!

---

## 💰 Google Places API Pricing

### Free Tier
- **$200 free credit per month**
- Each autocomplete request: ~$0.017
- **~11,700 free autocomplete requests/month**

### Example Usage
- 100 orders/month = ~$1.70/month (well within free tier)
- 1,000 orders/month = ~$17/month
- First $200 always free

**Recommendation:** Start without it, add later if needed.

---

## 📍 How It Works

### User Experience

**With Google API:**
1. User starts typing: "123 Main"
2. Dropdown shows: "123 Main St, Miami, FL 33101"
3. User clicks suggestion
4. All fields auto-fill ✨
5. Shipping calculates automatically

**Without Google API:**
1. User types full address manually
2. Selects state from dropdown
3. Enters ZIP code
4. Shipping calculates when ZIP entered

Both work perfectly!

---

## 🧩 Component Usage

### AddressAutocomplete Component

**Location:** `components/address-autocomplete.tsx`

**Props:**
```typescript
interface AddressAutocompleteProps {
  value: {
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  onChange: (data: AddressData) => void;
  onZipComplete?: (zip: string, state: string) => void;
  required?: boolean;
}
```

**Example Usage:**
```tsx
<AddressAutocomplete
  value={{
    address: formData.address,
    city: formData.city,
    state: formData.state,
    zip: formData.zip,
  }}
  onChange={(addressData) =>
    setFormData({ ...formData, ...addressData })
  }
  onZipComplete={(zip, state) => calculateShipping(zip, state)}
  required={true}
/>
```

---

## 📋 Where It's Used

### ✅ Currently Implemented

1. **Custom Order Page** ([app/custom-order/page.tsx](app/custom-order/page.tsx))
   - Step 3: Shipping Information
   - Full address autocomplete
   - Auto-calculates shipping

2. **Checkout Page** ([app/checkout/page.tsx](app/checkout/page.tsx))
   - Shipping address section
   - Required fields
   - Auto-calculates shipping

### 🔮 Can Be Added To

- Admin invoice creation
- Workshop booking addresses
- Any form that needs US addresses

---

## 🚨 Troubleshooting

### Autocomplete Not Showing

**Check 1: API Key Configuration**
```powershell
# Verify environment variable exists
echo $env:NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
```

**Check 2: Browser Console**
Open DevTools (F12) → Console
- Look for Google Maps errors
- Check for API key errors

**Check 3: API Restrictions**
- Verify domain is whitelisted in Google Cloud Console
- Check Places API is enabled

### "This page can't load Google Maps correctly"

**Solution:**
1. Check API key is valid
2. Verify billing is enabled (even for free tier)
3. Check HTTP referrer restrictions

### Manual Entry Still Works

**This is intentional!**
- Component gracefully falls back to manual entry
- State dropdown always works
- No errors shown to users

---

## 🎨 Customization

### Change States List

Edit `components/address-autocomplete.tsx`:
```typescript
export const US_STATES = [
  { code: 'FL', name: 'Florida' },
  // Add/remove states as needed
];
```

### Change Placeholder Text

```tsx
<Input
  placeholder="Start typing your address..."  // Change this
  autoComplete="off"
/>
```

### Style the Dropdown

Google Places dropdown uses Google's default styling. To customize:
```css
.pac-container {
  /* Your custom styles */
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
```

---

## ✅ Testing Checklist

### With Google API:
- [ ] Start typing address shows suggestions
- [ ] Clicking suggestion fills all fields
- [ ] City auto-fills correctly
- [ ] State auto-fills as 2-letter code
- [ ] ZIP auto-fills correctly
- [ ] Shipping calculates after selection
- [ ] Works on mobile devices

### Without Google API:
- [ ] Can type address manually
- [ ] State dropdown shows all states
- [ ] Can select state from dropdown
- [ ] ZIP code triggers shipping calculation
- [ ] No errors in console
- [ ] Form submits successfully

---

## 🔐 Security Best Practices

1. **Restrict API Key:**
   - Only enable Places API
   - Add HTTP referrer restrictions
   - Never commit key to GitHub

2. **Environment Variables:**
   - Use `NEXT_PUBLIC_` prefix for client-side
   - Add to `.gitignore`
   - Store in Vercel securely

3. **Monitor Usage:**
   - Check Google Cloud Console monthly
   - Set up billing alerts
   - Review quota usage

---

## 📊 Analytics

Track autocomplete usage:
```typescript
// When address selected
onChange={(addressData) => {
  // Send to analytics
  gtag('event', 'address_autocomplete_used');
  setFormData({ ...formData, ...addressData });
}}
```

---

## 💡 Pro Tips

1. **Start Without API:**
   - Test with manual entry first
   - Add Google API later if needed
   - Most small businesses don't need it

2. **Monitor Free Tier:**
   - $200/month is generous
   - Set billing alerts at $50
   - Pause API if over budget

3. **Mobile Testing:**
   - Test on real devices
   - Ensure dropdown shows properly
   - Verify keyboard behavior

---

## 📞 Support

**Google Maps Issues:**
- [Google Cloud Support](https://cloud.google.com/support)
- [Places API Documentation](https://developers.google.com/maps/documentation/places/web-service)

**Component Issues:**
- Check browser console for errors
- Verify environment variables
- Test with/without API key

---

**Last Updated:** February 2, 2026  
**Status:** ✅ Fully Operational (with or without Google API)
