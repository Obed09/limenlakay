// Email notification utility for Limen Lakay
// This sends notifications to info@limenlakay.com for all customer interactions

const BUSINESS_EMAIL = 'info@limenlakay.com';

interface EmailNotification {
  type: 'inquiry' | 'feedback' | 'chat' | 'order_tracking';
  subject: string;
  data: any;
}

// Format email content based on type
function formatEmailContent(notification: EmailNotification): string {
  const { type, data } = notification;
  
  switch (type) {
    case 'inquiry':
      return `
        <h2>New Custom Order Inquiry</h2>
        <p><strong>From:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
        <p><strong>Order Type:</strong> ${data.order_type || 'Not specified'}</p>
        <p><strong>Vessel Preference:</strong> ${data.vessel_preference || 'Not specified'}</p>
        <p><strong>Scent Preference:</strong> ${data.scent_preference || 'Not specified'}</p>
        <p><strong>Quantity:</strong> ${data.quantity || 'Not specified'}</p>
        <p><strong>Message:</strong></p>
        <p>${data.message || 'No message provided'}</p>
        <hr>
        <p><em>Respond within 24 hours to maintain excellent customer service!</em></p>
      `;
      
    case 'feedback':
      return `
        <h2>New Customer Feedback</h2>
        <p><strong>Rating:</strong> ${'⭐'.repeat(data.rating)} (${data.rating}/5)</p>
        <p><strong>From:</strong> ${data.customer_name || 'Anonymous'}</p>
        <p><strong>Email:</strong> ${data.customer_email || 'Not provided'}</p>
        <p><strong>Comment:</strong></p>
        <p>${data.comment}</p>
        <hr>
        <p><em>Consider featuring this review on your website if it's positive!</em></p>
      `;
      
    case 'chat':
      return `
        <h2>New Chat Message</h2>
        <p><strong>From:</strong> ${data.sender_name || 'Customer'}</p>
        <p><strong>Email:</strong> ${data.sender_email || 'Not provided'}</p>
        <p><strong>Session ID:</strong> ${data.session_id}</p>
        <p><strong>Message:</strong></p>
        <p>${data.message_text}</p>
        <hr>
        <p><em>Please respond to the customer within 24 hours through the chat system.</em></p>
      `;
      
    case 'order_tracking':
      return `
        <h2>Order Tracking Request</h2>
        <p><strong>Tracking Number:</strong> ${data.tracking_number}</p>
        <p><strong>Customer:</strong> ${data.customer_name}</p>
        <p><strong>Email:</strong> ${data.customer_email}</p>
        <p><strong>Current Status:</strong> ${data.order_status}</p>
        <hr>
        <p><em>Customer is checking their order status. Ensure tracking information is up to date.</em></p>
      `;
      
    default:
      return `<p>New notification from Limen Lakay website</p>`;
  }
}

// Send email notification using Supabase Edge Function
export async function sendEmailNotification(notification: EmailNotification): Promise<{ success: boolean; error?: any }> {
  try {
    // Option 1: Using Supabase Edge Function (recommended for production)
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        to: BUSINESS_EMAIL,
        subject: notification.subject,
        html: formatEmailContent(notification),
        replyTo: notification.data.email || BUSINESS_EMAIL,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending email notification:', error);
    
    // Fallback: Log to console for development
    console.log('EMAIL NOTIFICATION:', {
      to: BUSINESS_EMAIL,
      subject: notification.subject,
      content: formatEmailContent(notification),
    });
    
    return { success: false, error };
  }
}

// Specific notification functions for each type
export async function notifyNewInquiry(inquiryData: any) {
  return sendEmailNotification({
    type: 'inquiry',
    subject: `New Custom Order Inquiry from ${inquiryData.name}`,
    data: inquiryData,
  });
}

export async function notifyNewFeedback(feedbackData: any) {
  return sendEmailNotification({
    type: 'feedback',
    subject: `New Customer Feedback (${feedbackData.rating} stars)`,
    data: feedbackData,
  });
}

export async function notifyNewChatMessage(chatData: any) {
  return sendEmailNotification({
    type: 'chat',
    subject: `New Chat Message from Customer`,
    data: chatData,
  });
}

export async function notifyOrderTracking(trackingData: any) {
  return sendEmailNotification({
    type: 'order_tracking',
    subject: `Order Tracking Request - ${trackingData.tracking_number}`,
    data: trackingData,
  });
}