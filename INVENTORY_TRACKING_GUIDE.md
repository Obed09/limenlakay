# 🏪 Inventory Tracking System Guide

## Overview
This guide explains how to set up a complete tracking system so you get notified when boutiques/stores scan your QR codes for sales and inventory purposes.

---

## 🎯 How It Works

### Current State
- QR codes contain static product information (name, SKU, contact details)
- No tracking when someone scans them

### Tracking System Setup
1. **Each product gets a unique tracking ID**
2. **QR code links to:** `limenlakay.com/track/[unique-id]`
3. **When scanned:** System logs the scan and sends you a notification
4. **You see:** Real-time dashboard of all scans, sales, and inventory

---

## 📋 Step-by-Step Setup Instructions

### Step 1: Database Setup

Add this to your Supabase database:

```sql
-- Products Table (with unique tracking IDs)
CREATE TABLE tracked_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  current_location TEXT, -- e.g., "Main Store", "Boutique A"
  initial_quantity INTEGER DEFAULT 1,
  remaining_quantity INTEGER DEFAULT 1
);

-- Scans Table (logs every scan)
CREATE TABLE product_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES tracked_products(id),
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  scan_type TEXT, -- 'sale', 'inventory_check', 'received'
  location TEXT,
  scanned_by TEXT, -- store/boutique name
  notes TEXT,
  ip_address TEXT,
  user_agent TEXT
);

-- Inventory Movements Table
CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES tracked_products(id),
  movement_type TEXT, -- 'shipped', 'sold', 'returned'
  quantity INTEGER,
  from_location TEXT,
  to_location TEXT,
  moved_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- Retailers/Boutiques Table
CREATE TABLE retailers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  access_code TEXT UNIQUE, -- unique code for each retailer
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### Step 2: Generate Tracking QR Codes

Update your barcode system to create tracking URLs:

**QR Code Data Format:**
```
https://www.limenlakay.com/track/ABC123XYZ
```

Instead of static text, each QR code contains a unique URL.

---

### Step 3: Instructions for Boutiques/Stores

**Share this with your retailers:**

#### 📱 For Boutiques/Stores - Quick Start

**When you receive products:**
1. Scan the QR code on the label
2. Select "Received Inventory"
3. Enter your store code: `[STORE-CODE]`
4. Product is added to your inventory

**When you make a sale:**
1. Scan the QR code
2. Select "Record Sale"
3. Enter your store code
4. Limen Lakay is automatically notified

**For inventory checks:**
1. Scan any product QR code
2. Select "Inventory Check"
3. See current stock levels

---

### Step 4: Retailer Access Codes

**Assign each boutique a unique code:**

| Boutique Name | Access Code | Contact |
|--------------|-------------|---------|
| Boutique A   | BA-2025-001 | contact@boutiquea.com |
| Store B      | SB-2025-002 | store@storeb.com |
| Shop C       | SC-2025-003 | hello@shopc.com |

---

## 🔔 Notification Setup

### Option 1: Email Notifications (Recommended)

You'll receive emails whenever:
- ✅ A product is received by a retailer
- ✅ A sale is made
- ✅ Inventory is low
- ✅ A new scan occurs

**Sample Email:**
```
Subject: 🔔 New Sale - Lavender Bliss Candle

Product: Lavender Bliss Candle
SKU: LAV-001
Store: Boutique A
Action: Sale Recorded
Time: Dec 31, 2025 2:30 PM
Remaining Inventory: 4 units

View Dashboard: limenlakay.com/inventory-dashboard
```

### Option 2: SMS Notifications

Get instant text alerts for sales.

### Option 3: Real-time Dashboard

Access: `limenlakay.com/inventory-dashboard`

See:
- 📊 Real-time sales across all locations
- 📦 Current inventory levels
- 📍 Product locations
- 📈 Sales trends
- ⚠️ Low stock alerts

---

## 🏪 Retailer Onboarding Process

### When a new boutique wants to carry your products:

**Step 1: Create Retailer Account**
1. Add retailer to database
2. Generate unique access code
3. Send welcome email with instructions

**Step 2: Ship Products**
1. Generate tracking labels with QR codes
2. Include retailer instruction sheet
3. Send tracking information

**Step 3: Retailer Setup**
1. They scan the QR code
2. Enter their access code
3. System confirms receipt
4. You get notification

**Step 4: Ongoing Use**
- They scan QR codes for each sale
- You see real-time inventory updates
- Automatic reorder alerts when stock is low

---

## 📊 Dashboard Features

### Main Inventory Dashboard
- **Total Products:** 156 items
- **Active Locations:** 8 stores
- **This Month's Sales:** 89 units
- **Low Stock Alerts:** 3 products

### Per-Store View
- **Boutique A**
  - Lavender Bliss: 4 remaining
  - Vanilla Dream: 7 remaining
  - Last sale: 2 hours ago

### Analytics
- Best-selling products
- Slowest movers
- Revenue by location
- Scanning frequency

---

## 🔐 Security Features

1. **Access Codes:** Each retailer has a unique code
2. **Scan Logging:** All scans are recorded with timestamp
3. **IP Tracking:** Suspicious activity detection
4. **Audit Trail:** Complete history of all movements

---

## 📱 QR Code Scanning Options

### Option 1: Built-in System
Visit: `limenlakay.com/track/[code]`
- Works on any smartphone
- No app needed
- Simple interface

### Option 2: Retailer App (Future)
- Dedicated mobile app for stores
- Batch scanning
- Offline mode
- Receipt printing

---

## 💡 Advanced Features

### Automatic Reordering
- Set minimum stock levels
- Get alerts when low
- Auto-generate reorder suggestions

### Consignment Tracking
- Track unsold inventory
- Calculate commission
- Generate payment reports

### Multi-location Management
- See inventory across all stores
- Transfer products between locations
- Optimize distribution

---

## 🚀 Quick Implementation Checklist

- [ ] Set up database tables in Supabase
- [ ] Create tracking page (`/track/[id]`)
- [ ] Update barcode system to generate tracking URLs
- [ ] Set up email notifications
- [ ] Create inventory dashboard
- [ ] Generate retailer access codes
- [ ] Create retailer instruction PDF
- [ ] Test with one boutique
- [ ] Roll out to all retailers

---

## 📧 Contact for Technical Support

**For Retailers:**
- Email: support@limenlakay.com
- Phone: 561 593 0238

**For Technical Issues:**
- Dashboard access problems
- QR code scanning issues
- Inventory discrepancies

---

## Example Flow

**Scenario: Boutique A sells a Lavender Bliss Candle**

1. Customer buys candle at Boutique A
2. Store clerk scans QR code
3. Selects "Record Sale" + enters code BA-2025-001
4. **You receive instant notification:**
   - Email: "Sale at Boutique A - Lavender Bliss"
   - Dashboard updates: Boutique A inventory -1
5. System checks if reorder needed
6. Boutique A sees updated inventory
7. You see sale in real-time dashboard

---

## Next Steps

Would you like me to:
1. ✅ Build the tracking page system?
2. ✅ Create the inventory dashboard?
3. ✅ Set up email notifications?
4. ✅ Generate the retailer instruction PDF?

Let me know and I'll implement the complete tracking system!
