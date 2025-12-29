# Workshop Subscription System - Setup Guide

## Overview

The Workshop Subscription System enables you to manage cement creation workshop bookings with three subscription tiers. The system includes:

- **Customer-facing subscription page** with beautiful UI
- **Admin dashboard** for managing bookings
- **Database schema** for storing bookings and sessions
- **API endpoints** for handling bookings and admin actions
- **Payment integration** ready (currently in demo mode)

## Features

### Customer Features
- Browse workshop details and pricing tiers
- View image gallery and testimonials
- Interactive FAQ section
- Book workshops with preferred dates
- Receive confirmation (email ready to integrate)

### Admin Features
- View all bookings at a glance
- Filter and search bookings
- Update booking status (confirm/cancel)
- Track revenue and statistics
- Manage workshop sessions

### Subscription Tiers
1. **Single Workshop** - $65/session
2. **Monthly Membership** - $55/month (Most Popular)
3. **Premium Package** - $180/3 months

## Setup Instructions

### 1. Database Setup

Run the SQL schema in your Supabase dashboard:

```bash
# Navigate to Supabase SQL Editor
# Copy and run the contents of: database/workshop-schema.sql
```

This creates:
- `workshop_bookings` table
- `workshop_sessions` table (optional, for session management)
- Indexes for performance
- Row Level Security (RLS) policies
- Triggers for automatic updates

### 2. Environment Variables

Ensure your `.env.local` has Supabase configured:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Access the Pages

**Customer Page:**
```
http://localhost:3000/workshop-subscription
```

**Admin Dashboard:**
```
http://localhost:3000/admin-workshop
```

### 4. Payment Integration (Optional)

The system is ready for payment processor integration. To add Stripe:

1. Install Stripe:
```bash
npm install @stripe/stripe-js stripe
```

2. Add environment variables:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

3. Update the payment handler in `app/workshop-subscription/page.tsx`:

```typescript
// Add Stripe initialization
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// In handleSubmit, before saving to database:
const stripe = await stripePromise;
const response = await fetch('/api/create-payment-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: selectedPackage.price * 100, // Convert to cents
  }),
});

const { clientSecret } = await response.json();
// Continue with Stripe payment flow...
```

4. Create payment intent endpoint at `app/api/create-payment-intent/route.ts`

## Database Schema Details

### workshop_bookings Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Customer name |
| email | TEXT | Customer email |
| phone | TEXT | Customer phone |
| workshop_date | TEXT | Preferred workshop date |
| package_type | TEXT | single, monthly, or premium |
| package_price | DECIMAL | Price of selected package |
| status | TEXT | pending, confirmed, cancelled, completed |
| payment_status | TEXT | pending, completed, failed, refunded |
| payment_id | TEXT | Transaction ID from payment processor |
| notes | TEXT | Additional notes |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### workshop_sessions Table (Optional)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| session_date | TIMESTAMPTZ | Date and time of session |
| max_participants | INTEGER | Maximum capacity (default 12) |
| current_participants | INTEGER | Current booking count |
| status | TEXT | open, full, cancelled, completed |
| location | TEXT | Workshop location |
| instructor | TEXT | Instructor name |
| notes | TEXT | Session notes |

## API Endpoints

### POST /api/workshop-booking
Create a new workshop booking.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1-555-0123",
  "workshopDate": "april15",
  "packageType": "monthly",
  "packagePrice": 55,
  "cardNumber": "1234" // Last 4 digits only
}
```

**Response:**
```json
{
  "success": true,
  "booking": { ... },
  "message": "Booking confirmed successfully"
}
```

### GET /api/workshop-booking?email=user@example.com
Fetch bookings for a specific user.

### GET /api/workshop-booking/admin
Fetch all bookings (admin only).

### PATCH /api/workshop-booking/admin
Update booking status (admin only).

**Request Body:**
```json
{
  "bookingId": "uuid",
  "status": "confirmed"
}
```

## Customization

### Update Workshop Details

Edit the data in `app/workshop-subscription/page.tsx`:

```typescript
const workshopDetails = [
  { icon: Clock, label: "Duration", value: "2.5 hours" },
  // Add or modify details here
];

const packages: WorkshopPackage[] = [
  {
    id: "single",
    name: "Single Workshop",
    price: 65,
    // Modify pricing and features
  },
];
```

### Update Colors and Styling

The page uses Tailwind classes with amber/stone color palette:
- Amber: `bg-amber-700`, `text-amber-900`
- Stone: `bg-stone-700`, `text-stone-800`

To change the theme, update the color classes throughout the component.

### Add Email Notifications

Integrate with your email system in:
- `app/api/workshop-booking/route.ts` (after booking)
- `app/api/workshop-booking/admin/route.ts` (after status change)

Example using existing email utils:
```typescript
import { sendEmail } from "@/lib/email-notifications";

await sendEmail({
  to: booking.email,
  subject: "Workshop Booking Confirmed",
  html: `Your workshop on ${booking.workshop_date} is confirmed!`,
});
```

## Security Considerations

1. **RLS Policies**: The database has Row Level Security enabled
2. **Admin Access**: Add role checks in admin endpoints
3. **Payment Processing**: Never store full card numbers
4. **Input Validation**: All inputs are validated
5. **Error Handling**: Graceful error messages without exposing system details

## Admin Role Setup

To restrict admin access, update user metadata in Supabase:

1. Go to Authentication > Users
2. Select a user
3. Edit User Metadata
4. Add: `{"role": "admin"}`

Then uncomment admin checks in `app/api/workshop-booking/admin/route.ts`:

```typescript
const isAdmin = user.user_metadata?.role === 'admin';
if (!isAdmin) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

## Testing Checklist

- [ ] Database schema created successfully
- [ ] Workshop subscription page loads
- [ ] All three packages display correctly
- [ ] FAQ toggles work
- [ ] Payment modal opens and closes
- [ ] Form validation works
- [ ] Booking creates record in database
- [ ] Success modal displays after booking
- [ ] Admin page shows all bookings
- [ ] Admin can filter and search bookings
- [ ] Admin can update booking status
- [ ] Email notifications sent (if configured)

## Troubleshooting

### Database Connection Issues
- Verify Supabase environment variables
- Check if tables exist in Supabase dashboard
- Ensure RLS policies are properly configured

### Booking Not Saving
- Check browser console for errors
- Verify API endpoint is accessible
- Check Supabase logs for database errors

### Admin Page Not Loading
- Ensure user is authenticated
- Check if admin endpoint returns data
- Verify network requests in browser DevTools

## Production Deployment

Before deploying to production:

1. **Set up real payment processing** (Stripe/PayPal)
2. **Configure email notifications**
3. **Add proper admin authentication**
4. **Test all flows thoroughly**
5. **Set up error monitoring** (e.g., Sentry)
6. **Update workshop dates** to actual dates
7. **Replace placeholder images** with real photos
8. **Update contact information** (email, phone, address)
9. **Add terms of service** and privacy policy links
10. **Set up analytics** tracking

## Support

For questions or issues:
- Check the code comments for inline documentation
- Review Supabase logs for database issues
- Test API endpoints using tools like Postman
- Check browser console for client-side errors

## Future Enhancements

Potential features to add:
- Calendar view for available workshop dates
- Email reminders before workshop
- Customer dashboard to view bookings
- Review/rating system after workshop
- Gift card purchases
- Waitlist for fully booked sessions
- Integration with calendar (Google Calendar, iCal)
- SMS notifications
- Automated refund processing
- Workshop materials download portal
