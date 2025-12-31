# 🚀 Inventory Tracking System - Setup Instructions

## Quick Start Guide

Your complete inventory tracking system is now ready! Follow these steps to get it running.

---

## 📋 Step 1: Set Up the Database

1. **Go to your Supabase Dashboard**
   - Visit: https://app.supabase.com
   - Select your project

2. **Run the SQL Schema**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"
   - Copy and paste the contents from: `database/inventory-tracking-schema.sql`
   - Click "Run" to execute

3. **Verify Tables Created**
   - Check that these tables exist:
     - `tracked_products`
     - `retailers`
     - `product_scans`
     - `inventory_movements`
     - `inventory_snapshots`
     - `notifications`

---

## 🏪 Step 2: Add Your First Retailer

Run this in Supabase SQL Editor:

```sql
INSERT INTO retailers (name, email, phone, address, city, state, access_code, payment_terms, contact_person)
VALUES 
  (
    'Your Boutique Name',
    'contact@boutique.com',
    '561-234-5678',
    '123 Main Street',
    'Miami',
    'FL',
    'BTQ-2025-001',
    'consignment',
    'John Doe'
  );
```

**Important:** Each retailer needs a unique `access_code`. Use this format:
- `BTQ-2025-001` (Boutique)
- `SHP-2025-002` (Shop)
- `STR-2025-003` (Store)

---

## 📦 Step 3: Generate Your First Product

1. **Visit the Barcode System**
   - Go to: https://www.limenlakay.com/barcode-system

2. **Enter Product Details**
   - Product Name: "Lavender Bliss Candle"
   - SKU: "LAV-001"
   - Edit warning text and burning instructions as needed

3. **Click "Add Product"**
   - A tracking code will be automatically generated
   - QR code will now contain tracking URL: `limenlakay.com/track/[code]`

4. **Save to Database (Manual Step)**
   Run this in Supabase:
   ```sql
   INSERT INTO tracked_products (
     product_name, 
     sku, 
     tracking_code, 
     product_type, 
     fragrance, 
     price, 
     cost,
     initial_quantity,
     remaining_quantity
   )
   VALUES (
     'Lavender Bliss Candle',
     'LAV-001',
     'YOUR-TRACKING-CODE-HERE', -- Copy from the barcode system
     'candle',
     'Lavender',
     32.00,
     15.00,
     50,
     50
   );
   ```

---

## 📱 Step 4: Test the Tracking System

1. **Print a Label**
   - Click "Print Label" in the barcode system
   - Scan the QR code with your phone

2. **Record a Test Action**
   - Visit: https://www.limenlakay.com/track/[your-tracking-code]
   - Select "Record Sale"
   - Enter retailer access code: `BTQ-2025-001`
   - Fill in quantity and notes
   - Click "Submit"

3. **Check Dashboard**
   - Visit: https://www.limenlakay.com/inventory-dashboard
   - You should see the scan logged
   - Inventory should be updated

---

## 📧 Step 5: Set Up Email Notifications

### Option A: Use Existing Workshop Email (Recommended)

If you already have the workshop email system set up with SMTP2GO:

1. **Update the notification route**
   - Edit: `app/api/tracking/notify/route.ts`
   - Replace the TODO section with your existing email service

2. **Example Integration:**
```typescript
// In app/api/tracking/notify/route.ts
const response = await fetch('https://api.smtp2go.com/v3/email/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Smtp2go-Api-Key': process.env.SMTP2GO_API_KEY || '',
  },
  body: JSON.stringify({
    sender: 'noreply@limenlakay.com',
    to: [adminEmail],
    subject: subject,
    html_body: emailBody,
  }),
});
```

### Option B: Use SendGrid

```bash
npm install @sendgrid/mail
```

Update the route:
```typescript
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

await sgMail.send({
  to: adminEmail,
  from: 'noreply@limenlakay.com',
  subject: subject,
  html: emailBody,
});
```

---

## 🔐 Step 6: Secure Your Dashboard (Optional)

Add authentication to the inventory dashboard:

1. **Edit:** `app/inventory-dashboard/page.tsx`
2. **Add auth check at the top:**
```typescript
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function InventoryDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth/login");
  }
  
  // ... rest of component
}
```

---

## 📖 How to Use the System

### For You (Admin):

1. **Create Products**
   - Visit: `/barcode-system`
   - Generate tracking codes and labels
   - Print and attach to products

2. **Monitor Activity**
   - Visit: `/inventory-dashboard`
   - See real-time scans and sales
   - Check inventory levels
   - View retailer activity

3. **Receive Notifications**
   - Get instant emails when:
     - Products are sold
     - Inventory is checked
     - Stock is low
     - Returns are made

### For Retailers:

1. **Receive Products**
   - Scan QR code on label
   - Select "Received Inventory"
   - Enter their access code
   - System notifies you

2. **Record Sales**
   - Scan QR code at point of sale
   - Select "Record Sale"
   - Enter access code and price
   - You get instant notification

3. **Check Inventory**
   - Scan any product
   - Select "Inventory Check"
   - See current stock levels

---

## 📄 Retailer Instruction Sheet

Create a PDF with these instructions for your retailers:

### Quick Guide for Boutiques/Stores

**When You Receive Products:**
1. Scan QR code on product label
2. Select "📥 Received Inventory"
3. Enter your code: `[YOUR-CODE]`
4. Click Submit

**When You Make a Sale:**
1. Scan QR code
2. Select "🛍️ Record Sale"
3. Enter your code: `[YOUR-CODE]`
4. Enter sale price and quantity
5. Click Submit

**Need Help?**
📞 561 593 0238
✉️ info@limenlakay.com
🌐 www.limenlakay.com

---

## 🔄 Deployment

Deploy these changes to production:

```bash
git add .
git commit -m "Add complete inventory tracking system"
git push origin master
```

Vercel will automatically deploy. New pages will be available at:
- `/barcode-system` - Generate tracking labels
- `/track/[id]` - Product tracking page (for retailers)
- `/inventory-dashboard` - Your admin dashboard

---

## ✅ Testing Checklist

- [ ] Database tables created in Supabase
- [ ] At least one retailer added with access code
- [ ] At least one product added to tracked_products
- [ ] Generated barcode label with tracking QR code
- [ ] Scanned QR code and recorded test sale
- [ ] Sale appears in inventory dashboard
- [ ] Inventory quantity updated correctly
- [ ] Email notification sent (if configured)
- [ ] Retailer instruction sheet created
- [ ] Changes deployed to production

---

## 🆘 Troubleshooting

### QR Code Doesn't Work
- Make sure tracking code exists in `tracked_products` table
- Verify URL format: `https://www.limenlakay.com/track/[code]`

### "Invalid Access Code" Error
- Check retailer exists in `retailers` table
- Verify access code is correct (case-sensitive)

### Inventory Not Updating
- Check database triggers are enabled
- Verify RLS policies allow inserts

### Email Not Sending
- Check email service credentials in environment variables
- Verify API route is working: test with console.log

---

## 📞 Support

Need help? Contact:
- Email: info@limenlakay.com
- Phone: 561 593 0238

---

## 🎉 You're All Set!

Your complete inventory tracking system is now ready. Retailers can scan QR codes, you'll get instant notifications, and you can monitor everything from your dashboard.

Happy tracking! 🚀
