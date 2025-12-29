# Workshop Email Automation Setup Guide

## Overview
This system automatically sends thank you emails to workshop subscribers with their session details and meeting links.

## Features
- ✅ Automated email sending when users book workshops
- ✅ Customizable email templates from admin panel
- ✅ Workshop session management (dates, times, Zoom/Meet links)
- ✅ Email template variables: {name}, {date}, {time}, {link}
- ✅ Admin interface for easy management

## Setup Instructions

### 1. Database Setup

Run the SQL schema to create required tables:

```bash
# Navigate to Supabase dashboard SQL Editor
# Run the file: database/workshop-sessions-table.sql
```

This creates:
- `workshop_sessions` table - Stores workshop schedules with meeting links
- `email_templates` table - Stores customizable email templates
- Default "workshop_confirmation" template

### 2. Email Service Configuration

The system is ready to integrate with your email provider. Update the file:
`app/api/workshop-booking/send-email/route.ts`

**Option A: SMTP2GO (Recommended)**
```typescript
const response = await fetch('https://api.smtp2go.com/v3/email/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Smtp2go-Api-Key': process.env.SMTP2GO_API_KEY || '',
  },
  body: JSON.stringify({
    sender: 'info@limenlakay.com',
    to: [to],
    subject: subject,
    text_body: emailBody,
    html_body: htmlBody,
  }),
});
```

**Option B: SendGrid**
```typescript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: to,
  from: 'info@limenlakay.com',
  subject: subject,
  text: emailBody,
  html: htmlBody,
});
```

Add your API key to `.env.local`:
```
SMTP2GO_API_KEY=your_api_key_here
# OR
SENDGRID_API_KEY=your_api_key_here
```

### 3. Access Admin Pages

**Workshop Settings (Manage Sessions & Email Template):**
https://www.limenlakay.com/workshop-settings

**Workshop Bookings (View All Bookings):**
https://www.limenlakay.com/admin-workshop

## How It Works

### Booking Flow
1. User fills out workshop booking form on `/workshop-subscription`
2. System saves booking to `workshop_bookings` table
3. System fetches session details (time, meeting link) from `workshop_sessions` table
4. Automated email is sent using the template from `email_templates` table
5. Email variables {name}, {date}, {time}, {link} are replaced with actual values
6. User receives confirmation email immediately

### Email Template Variables
- `{name}` - Subscriber's name
- `{date}` - Workshop date selected
- `{time}` - Workshop time from session
- `{link}` - Zoom/Meet link from session

## Managing Workshop Sessions

### Add New Session
1. Go to https://www.limenlakay.com/workshop-settings
2. Scroll to "Workshop Sessions" section
3. Fill in:
   - Date (e.g., 2025-01-15)
   - Time (e.g., 14:00 or 2:00 PM)
   - Meeting Link (e.g., https://zoom.us/j/123456789)
4. Click "Add Session"

### Edit Email Template
1. Go to https://www.limenlakay.com/workshop-settings
2. Edit the "Email Template Editor" section
3. Use variables: {name}, {date}, {time}, {link}
4. Click "Save Email Template"

## Example Email Template

```
Subject: Your Concrete Creations Workshop Access

Body:
Hi {name},

Thank you for subscribing to our workshop! We're excited to have you.

Your Session: {date} at {time}
Join via: {link}

Please save this link for your selected date/time. We'll send a reminder before the workshop with preparation details.

See you soon!

Best,
Limen Lakay LLC
```

## Testing

### Test the Email System
1. Create a workshop session at `/workshop-settings`
2. Book a workshop at `/workshop-subscription`
3. Check console logs for email preview
4. Once email service is configured, check your inbox

### Troubleshooting
- **Email not sending:** Check console logs in browser and server
- **No session details:** Make sure you created a session for that date
- **Template not updating:** Clear browser cache, verify database update
- **Meeting link missing:** Add meeting link to the session in admin panel

## API Endpoints

### Email Template
- **GET** `/api/workshop-booking/email-template` - Fetch current template
- **PUT** `/api/workshop-booking/email-template` - Update template

### Workshop Sessions
- **GET** `/api/workshop-booking/sessions` - List all sessions
- **POST** `/api/workshop-booking/sessions` - Create new session
- **PUT** `/api/workshop-booking/sessions` - Update session

### Send Email
- **POST** `/api/workshop-booking/send-email` - Send confirmation email

## Files Created/Modified

### New Files:
- `/database/workshop-sessions-table.sql` - Database schema
- `/lib/workshop-email.ts` - Email utility functions
- `/app/workshop-settings/page.tsx` - Admin settings page
- `/app/api/workshop-booking/email-template/route.ts` - Email template API
- `/app/api/workshop-booking/send-email/route.ts` - Email sending API
- `/app/api/workshop-booking/sessions/route.ts` - Sessions management API

### Modified Files:
- `/app/api/workshop-booking/route.ts` - Added automatic email sending

## Next Steps

1. ✅ Run database schema in Supabase
2. ✅ Configure email service (SMTP2GO or SendGrid)
3. ✅ Add API key to environment variables
4. ✅ Create workshop sessions in admin panel
5. ✅ Test booking and email flow
6. ✅ Customize email template as needed

## Security Notes
- Protect admin routes with authentication
- Never expose email API keys in client-side code
- Use environment variables for sensitive data
- Implement rate limiting for email sending
- Validate all user inputs

## Support
For questions or issues, contact the development team or refer to:
- SMTP2GO Setup: `/SMTP2GO_SETUP.md`
- Supabase Email: `/SUPABASE_EMAIL_SETUP.md`
