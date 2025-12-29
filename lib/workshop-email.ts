// Workshop Email Service
// Handles sending automated emails to workshop subscribers

interface WorkshopEmailData {
  name: string;
  email: string;
  date: string;
  time: string;
  meetingLink: string;
}

interface EmailTemplate {
  subject: string;
  body: string;
}

/**
 * Replaces template variables with actual values
 */
function replaceTemplateVariables(template: string, data: WorkshopEmailData): string {
  return template
    .replace(/{name}/g, data.name)
    .replace(/{date}/g, data.date)
    .replace(/{time}/g, data.time)
    .replace(/{link}/g, data.meetingLink);
}

/**
 * Fetches the current email template from the database
 */
export async function getEmailTemplate(): Promise<EmailTemplate> {
  try {
    const response = await fetch('/api/workshop-booking/email-template');
    const data = await response.json();
    
    if (data.template) {
      return {
        subject: data.template.subject,
        body: data.template.body,
      };
    }
  } catch (error) {
    console.error('Error fetching email template:', error);
  }
  
  // Fallback to default template
  return {
    subject: 'Your Concrete Creations Workshop Access',
    body: `Hi {name},

Thank you for subscribing to our workshop! We're excited to have you.

Your Session: {date} at {time}
Join via: {link}

Please save this link for your selected date/time. We'll send a reminder before the workshop with preparation details.

See you soon!

Best,
Limen Lakay LLC`,
  };
}

/**
 * Sends workshop confirmation email
 */
export async function sendWorkshopConfirmationEmail(data: WorkshopEmailData): Promise<boolean> {
  try {
    // Get the current email template
    const template = await getEmailTemplate();
    
    // Replace variables in subject and body
    const subject = replaceTemplateVariables(template.subject, data);
    const body = replaceTemplateVariables(template.body, data);
    
    // Send email via API
    const response = await fetch('/api/workshop-booking/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: data.email,
        subject,
        body,
        htmlBody: body.replace(/\n/g, '<br>'), // Convert newlines to HTML breaks
      }),
    });
    
    if (!response.ok) {
      console.error('Failed to send email:', await response.text());
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error sending workshop confirmation email:', error);
    return false;
  }
}

/**
 * Sends workshop reminder email (can be scheduled)
 */
export async function sendWorkshopReminderEmail(data: WorkshopEmailData): Promise<boolean> {
  try {
    const subject = `Reminder: Workshop Tomorrow - ${data.date}`;
    const body = `Hi ${data.name},

This is a friendly reminder about your upcoming Concrete Creations Workshop!

Session: ${data.date} at ${data.time}
Join via: ${data.meetingLink}

What to bring:
- Wear comfortable clothes you don't mind getting dusty (aprons provided)
- Bring your creativity and enthusiasm!

We can't wait to create with you!

Best,
Limen Lakay LLC`;
    
    const response = await fetch('/api/workshop-booking/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: data.email,
        subject,
        body,
        htmlBody: body.replace(/\n/g, '<br>'),
      }),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error sending reminder email:', error);
    return false;
  }
}
