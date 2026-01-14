# Invoice System Setup and Usage Guide

## Overview
Complete invoice management system for Limen Lakay LLC with professional features including:
- Create, edit, and manage invoices
- Send invoices to customers
- Track payment status
- Download/Print invoices
- Duplicate invoices
- Discount and tax calculations
- Auto-calculated totals

## Database Setup

### 1. Run the SQL Schema
Execute the invoice schema in your Supabase SQL Editor:

```bash
# Location: database/invoices-schema.sql
```

This creates:
- `invoices` table - Main invoice records
- `invoice_items` table - Line items for each invoice
- Indexes for performance
- Row Level Security policies
- Auto-update triggers
- Sample invoice data

### 2. Verify Tables
After running the schema, verify in Supabase:
- Go to Table Editor
- Check that `invoices` and `invoice_items` tables exist
- Verify sample invoice INV-10 is created

## Features

### Invoice List Page (`/admin-invoices`)
- View all invoices in a searchable list
- Filter by invoice number, customer name, or email
- Status badges (Draft, Sent, Paid, Overdue, Cancelled)
- Quick navigation to invoice details
- Create new invoice button

### Invoice Detail/Edit Page (`/admin-invoices/[id]`)

#### Action Buttons
- **Send**: Mark invoice as sent and notify customer
- **Download**: Print/save invoice as PDF
- **More Options Dropdown**:
  - Edit: Enter edit mode to modify invoice
  - Mark as Paid: Update status to paid
  - Duplicate: Create a copy of the invoice
  - Delete: Remove invoice permanently

#### Invoice Components

**Header Section**:
- Company branding (Limen Lakay LLC logo)
- Invoice number (auto-generated)
- Status badge

**Customer Information**:
- Customer name
- Email address
- Phone number (optional)
- Address (optional)

**Dates**:
- Invoice date
- Due date
- Balance due (highlighted)

**Line Items**:
- Item description
- Quantity
- Rate (price per unit)
- Amount (auto-calculated)
- Add/remove items dynamically

**Calculations**:
- Subtotal (sum of all items)
- **Discount** (percentage-based, reduces subtotal)
- Tax (percentage-based on subtotal after discount)
- **Total** (final amount)

**Additional Information**:
- Notes: Payment instructions (Zelle, etc.)
- Terms: Payment terms and policies

## Usage Guide

### Creating a New Invoice

1. Navigate to `/admin-invoices`
2. Click "Create Invoice" button
3. Invoice opens in edit mode with defaults:
   - Auto-generated invoice number
   - Today's date
   - Due date (7 days from today)
   - 7% tax rate (Florida standard)
   - Default payment instructions

4. Fill in customer information:
   - Name (required)
   - Email (required)
   - Phone (optional)
   - Address (optional)

5. Add line items:
   - Enter item description
   - Set quantity
   - Set rate (price)
   - Amount calculates automatically
   - Click "+ Add Item" for more items

6. Apply discount (if needed):
   - Enter discount percentage (0-100)
   - Discount amount calculates automatically
   - Applied before tax

7. Adjust tax rate if needed:
   - Default is 7%
   - Tax applies to subtotal after discount

8. Add notes and terms:
   - Notes: Payment instructions
   - Terms: Payment policies and conditions

9. Click "Save" to create invoice

### Editing an Existing Invoice

1. Open invoice from list
2. Click "More options" → "Edit"
3. Make desired changes
4. Click "Save" to update
5. Click "Cancel" to discard changes

### Sending an Invoice

1. Open invoice
2. Click "Send" button
3. Status changes to "Sent"
4. (Future enhancement: Auto-send email)

### Marking as Paid

1. Open invoice
2. Click "More options" → "Mark as Paid"
3. Status changes to "Paid"
4. Invoice cannot be sent again

### Downloading/Printing

1. Open invoice
2. Click "Download" button
3. Browser print dialog opens
4. Save as PDF or print

### Duplicating an Invoice

1. Open invoice
2. Click "More options" → "Duplicate"
3. New invoice created with:
   - New invoice number
   - Today's date
   - New due date (7 days)
   - Same customer info
   - Same items and amounts
   - Draft status

### Deleting an Invoice

1. Open invoice
2. Click "More options" → "Delete"
3. Confirm deletion
4. Invoice and all items removed

## Invoice Statuses

- **Draft**: Not yet sent to customer
- **Sent**: Invoice sent to customer
- **Paid**: Payment received
- **Overdue**: Past due date (auto-updates)
- **Cancelled**: Invoice cancelled

## Automatic Features

### Auto-calculations
- Item amounts: quantity × rate
- Subtotal: sum of all items
- Discount amount: subtotal × discount %
- Tax amount: (subtotal - discount) × tax %
- Total: subtotal - discount + tax

### Auto-generated
- Invoice numbers: INV-{timestamp}
- Timestamps: created_at, updated_at

### Auto-update
- Overdue status when past due date
- Updated_at timestamp on changes

## Customization

### Company Branding
Edit in `app/admin-invoices/[id]/page.tsx`:
```tsx
<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
  <span className="text-2xl font-bold text-primary">LL</span>
</div>
<h2 className="text-lg font-semibold">Limen Lakay LLC</h2>
```

Add company logo:
```tsx
<Image src="/logo.png" alt="Logo" width={64} height={64} />
```

### Default Tax Rate
Change default in `initializeNewInvoice()`:
```tsx
tax_rate: 7, // Change to your tax rate
```

### Default Terms
Edit default terms in `initializeNewInvoice()`:
```tsx
terms: 'Your custom terms here...'
```

### Payment Instructions
Edit default notes in `initializeNewInvoice()`:
```tsx
notes: 'Your payment instructions here...'
```

## Email Integration (Future Enhancement)

To add email functionality:

1. Use existing SMTP2GO setup (see SMTP2GO_SETUP.md)
2. Create API endpoint: `app/api/invoices/send/route.ts`
3. Send invoice as PDF attachment
4. Include payment link

Example structure:
```tsx
POST /api/invoices/send
{
  "invoiceId": "uuid",
  "recipientEmail": "customer@example.com"
}
```

## Payment Integration (Future Enhancement)

To add online payment:

1. Use existing Stripe setup (see STRIPE_WORKSHOP_SETUP.md)
2. Create payment link for each invoice
3. Add "Pay Now" button to invoice
4. Auto-update status when paid

## Mobile Responsive

The invoice system is fully responsive:
- Desktop: Full-width layout with side-by-side sections
- Tablet: Stacked layout with readable columns
- Mobile: Single column, optimized buttons
- Print: Clean, professional PDF output

## Tips & Best Practices

1. **Invoice Numbers**: Use sequential or timestamp-based numbers
2. **Due Dates**: Standard is 7-30 days from invoice date
3. **Tax Rates**: Update based on your location
4. **Discounts**: Apply before tax for accurate calculations
5. **Notes**: Include clear payment instructions
6. **Terms**: Be explicit about late fees and policies
7. **Backup**: Export invoices regularly
8. **Status Updates**: Keep statuses current for reporting

## Troubleshooting

### Invoice not saving
- Check Supabase connection
- Verify RLS policies are enabled
- Check browser console for errors

### Calculations incorrect
- Verify tax rate format (use 7 not 0.07)
- Check discount percentage (0-100)
- Ensure item quantities and rates are numbers

### Print layout issues
- Use Chrome or Edge for best print results
- Check print preview before saving
- Adjust page margins in print dialog

### Can't delete invoice
- Check if RLS policies allow deletion
- Ensure you're authenticated
- Items are auto-deleted (CASCADE)

## Future Enhancements

- [ ] Email invoice to customer
- [ ] Recurring invoices
- [ ] Invoice templates
- [ ] Payment reminders
- [ ] Invoice reports/analytics
- [ ] Multiple currencies
- [ ] PDF generation (without print)
- [ ] Bulk invoice actions
- [ ] Invoice comments/history
- [ ] Custom branding per client

## Support

For issues or questions:
1. Check this guide
2. Review database schema
3. Check Supabase logs
4. Verify RLS policies
5. Test with sample invoice (INV-10)

---

Last Updated: January 2026
Version: 1.0
