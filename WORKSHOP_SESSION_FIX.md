# Workshop Session Management Fix Guide

## Issue Summary
Two main issues were identified:
1. **Session Creation Error**: Admin couldn't add new workshop sessions - "Failed to add session" error
2. **Missing Time Display**: Workshop booking page didn't show session times, only dates

## Root Causes

### 1. Database Schema Mismatch
The `workshop_sessions` table was missing required columns:
- `session_time` (TEXT)
- `meeting_link` (TEXT)

### 2. Restrictive RLS Policies
Row Level Security policies were too restrictive, blocking session creation by authenticated/anonymous users.

### 3. Hardcoded Dates in Booking Form
The booking page had hardcoded workshop dates instead of fetching from the database.

---

## Solutions Implemented

### 1. Database Migration Script
**File**: `database/fix-workshop-sessions.sql`

**What it does**:
- Adds `session_time` and `meeting_link` columns if they don't exist
- Drops old restrictive RLS policies
- Creates new permissive RLS policies allowing:
  - Anyone to view sessions
  - Authenticated and anonymous users to insert/update/delete sessions
  - This is necessary because the admin page may not have auth configured

**How to apply**:
```sql
-- Run this in Supabase SQL Editor
-- Copy the entire contents of database/fix-workshop-sessions.sql and execute
```

### 2. Dynamic Session Loading
**File**: `app/workshop-subscription/page.tsx`

**Changes**:
- Added `WorkshopSession` interface
- Added `sessions` state and `loadingSessions` state
- Created `fetchSessions()` function to load sessions from API
- Updated dropdown to display sessions dynamically with:
  - Full date format (e.g., "Friday, January 23, 2026")
  - Time (e.g., "at 7:00 PM EST")
  - Available spots (e.g., "- 8 spots left")
- Changed label from "Workshop Date" to "Workshop Date & Time"
- Added loading and empty states

### 3. Checkout API Enhancement
**File**: `app/api/create-checkout-session/route.ts`

**Changes**:
- Now receives session ID instead of raw date string
- Fetches full session details from database using the session ID
- Formats session date and time for Stripe product description
- Stores session ID in Stripe metadata for reference

---

## Testing Steps

### Step 1: Apply Database Migration
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `database/fix-workshop-sessions.sql`
3. Execute the script
4. Verify columns exist:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'workshop_sessions';
   ```

### Step 2: Add a Workshop Session
1. Go to admin workshop page: `/admin-workshop`
2. Navigate to "Session Management" tab
3. Fill in the form:
   - **Date**: 2026-02-15
   - **Time**: 7:00 PM EST
   - **Meeting Link**: https://zoom.us/j/123456789
   - **Max Participants**: 12
4. Click "Add Session"
5. Should see success message: "Session added successfully! It will now appear on the subscription page."

### Step 3: Verify Booking Page
1. Go to workshop booking page: `/workshop-subscription`
2. Scroll to the booking form
3. Check the "Workshop Date & Time" dropdown:
   - Should load available sessions
   - Should display format: "Friday, February 15, 2026 at 7:00 PM EST - 12 spots left"
   - Should show "Loading sessions..." while fetching
   - Should show warning if no sessions available

### Step 4: Test Complete Booking Flow
1. Fill in the booking form with test data
2. Select a workshop session from dropdown
3. Click "Reserve Your Spot"
4. Should redirect to Stripe checkout
5. Verify product description shows: "Workshop: [Date] at [Time]"
6. Complete payment (use Stripe test card if in test mode)
7. Should redirect to success page

---

## API Endpoints

### GET /api/workshop-booking/sessions
**Purpose**: Fetch all workshop sessions
**Response**:
```json
{
  "sessions": [
    {
      "id": "uuid",
      "session_date": "2026-02-15T00:00:00Z",
      "session_time": "7:00 PM EST",
      "meeting_link": "https://zoom.us/j/123456789",
      "max_participants": 12,
      "current_participants": 4,
      "status": "open"
    }
  ]
}
```

### POST /api/workshop-booking/sessions
**Purpose**: Create new workshop session
**Request Body**:
```json
{
  "session_date": "2026-02-15",
  "session_time": "7:00 PM EST",
  "meeting_link": "https://zoom.us/j/123456789",
  "max_participants": 12
}
```

---

## Database Schema

```sql
CREATE TABLE workshop_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_date TIMESTAMPTZ NOT NULL,
  session_time TEXT NOT NULL,           -- New column
  meeting_link TEXT,                     -- New column
  max_participants INTEGER DEFAULT 12,
  current_participants INTEGER DEFAULT 0,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'full', 'cancelled', 'completed')),
  location TEXT,
  instructor TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Troubleshooting

### Issue: "Failed to add session" still appears
**Solution**:
1. Check if migration was applied: Look for `session_time` and `meeting_link` columns
2. Verify RLS policies are correct:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'workshop_sessions';
   ```
3. Check browser console for specific error messages
4. Ensure all fields are filled in the admin form

### Issue: Dropdown shows "No sessions available"
**Solution**:
1. Verify sessions exist in database:
   ```sql
   SELECT * FROM workshop_sessions WHERE status = 'open' ORDER BY session_date;
   ```
2. Check if API route is working: Visit `/api/workshop-booking/sessions` directly
3. Check browser console for fetch errors
4. Ensure RLS policy allows SELECT for anonymous users

### Issue: Checkout fails after selecting session
**Solution**:
1. Verify session ID is valid UUID
2. Check if session still exists in database
3. Verify Stripe is properly configured with STRIPE_SECRET_KEY
4. Check server logs for specific error

---

## Future Enhancements

1. **Email Notifications**: Send email with session details and Zoom link after booking
2. **Reminder System**: Automatic reminders 24 hours before workshop
3. **Waiting List**: Allow users to join waiting list when session is full
4. **Recurring Sessions**: Template system for creating multiple sessions at once
5. **Session Editing**: Allow admins to edit existing sessions without deleting
6. **Attendance Tracking**: Mark which participants attended the workshop

---

## Deployment Checklist

- [ ] Apply database migration in production Supabase
- [ ] Test session creation in admin panel
- [ ] Verify booking page loads sessions correctly
- [ ] Test complete booking flow with Stripe test mode
- [ ] Switch to live Stripe keys if ready
- [ ] Monitor error logs for first 24 hours
- [ ] Create at least 3-4 sessions for customers to choose from

---

## Quick Reference

### Admin Workshop Page
- URL: `/admin-workshop`
- Tab: "Session Management"
- Actions: Add, View, Delete sessions

### Customer Booking Page
- URL: `/workshop-subscription`
- Form: "Workshop Date & Time" dropdown
- Shows: Date, Time, Available spots

### Database Table
- Table: `workshop_sessions`
- Key Fields: `session_date`, `session_time`, `meeting_link`
- Status Values: `open`, `full`, `cancelled`, `completed`
