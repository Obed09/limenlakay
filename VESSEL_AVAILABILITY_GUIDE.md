# Vessel Availability System Guide

## Overview
Control how vessels appear to customers with three availability options.

## Database Setup

Run this SQL in Supabase:
```sql
-- File: database/add-vessel-availability-options.sql
```

This adds two new columns to `candle_vessels` table:
- `allow_custom_candle` - Boolean (default: true)
- `allow_empty_vessel` - Boolean (default: false)

## Admin Interface

### Location
`/admin-vessels` - Vessel management page

### New Toggle Options

When creating/editing a vessel, you'll see two toggle switches:

#### 1. **Allow Custom Candle Creation** 🕯️
- **ON (Blue)**: Vessel appears in "Create Your Custom Candle" page
- Customers can select this vessel + choose a scent
- Default: ON for all vessels

#### 2. **Available as Empty Vessel** 📦
- **ON (Green)**: Vessel can be purchased empty (no candle/scent)
- Appears in "Buy Empty Vessels" section
- Default: OFF for most vessels

### Usage Scenarios

**Scenario 1: Standard Custom Candle Vessel**
- ✅ Allow Custom Candle Creation: ON
- ❌ Available as Empty Vessel: OFF
- Result: Shows in custom candle builder only

**Scenario 2: Empty Vessel for Sale**
- ❌ Allow Custom Candle Creation: OFF
- ✅ Available as Empty Vessel: ON  
- Result: Shows in empty vessel shop only

**Scenario 3: Both Options**
- ✅ Allow Custom Candle Creation: ON
- ✅ Available as Empty Vessel: ON
- Result: Shows in BOTH custom candle builder AND empty vessel shop

**Scenario 4: Hidden/Out of Stock**
- ❌ Allow Custom Candle Creation: OFF
- ❌ Available as Empty Vessel: OFF
- Result: Not visible to customers (hidden)

## Frontend Integration

### Custom Candle Page (`/custom-order`)
**✅ UPDATED** - Now filters vessels where `allow_custom_candle = true`:
```tsx
supabase
  .from('candle_vessels')
  .select('*')
  .eq('is_available', true)
  .eq('allow_custom_candle', true)  // ← New filter added!
  .order('name')
```

### Empty Vessels Page (Future - when created)
Should filter vessels where `allow_empty_vessel = true`:
```tsx
const emptyVessels = await supabase
  .from('candle_vessels')
  .select('*')
  .eq('is_available', true)
  .eq('allow_empty_vessel', true)  // ← Filter for empty vessel shop
  .order('name');
```

### How It Works:
1. **Admin toggles vessel settings** → Changes saved to database
2. **Customer visits order page** → Query automatically filters based on toggles
3. **Real-time updates** → Changes appear immediately (no caching)

## Step-by-Step: Setting Up Vessel Availability

### 1. Run Database Migration
```bash
# In Supabase SQL Editor, run:
database/add-vessel-availability-options.sql
```

### 2. Access Admin Panel
Navigate to: `https://limenlakay.com/admin-vessels`

### 3. Edit Existing Vessels
- Click edit icon on any vessel
- Scroll to "Availability Options" section
- Toggle switches based on how you want to sell this vessel
- Click "Update Vessel"

### 4. Create New Vessels
- Click "Add New Vessel"
- Fill in vessel details
- Set availability options before saving
- Click "Create Vessel"

## Visual Indicators (Coming Soon)

The vessel list will show badges:
- 🕯️ Blue badge: Custom candle enabled
- 📦 Green badge: Empty vessel enabled
- Both badges: Available in both places
- No badges: Hidden from customers

## Benefits

✅ **Flexibility**: Control exactly where each vessel appears
✅ **Inventory Management**: Hide out-of-stock items easily  
✅ **Customer Experience**: Show relevant options only
✅ **Business Logic**: Separate custom vs. empty vessel sales

## Troubleshooting

**Vessel not showing in custom candle page?**
- Check `allow_custom_candle` is ON
- Check `is_available` is ON
- Verify vessel has stock

**Can't purchase empty vessel?**
- Check `allow_empty_vessel` is ON
- Check `is_available` is ON
- Verify price is set correctly

**Need both options?**
- Enable BOTH toggles
- Vessel will appear in both sections

---

Last Updated: January 2026
