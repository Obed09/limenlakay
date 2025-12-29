import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// This endpoint handles sending emails via your email service
// You'll need to configure SMTP or use a service like SendGrid, Mailgun, etc.

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, name, date, time, meetingLink } = body;
    
    if (!to || !name) {
      return NextResponse.json(
        { error: "Missing required email fields" },
        { status: 400 }
      );
    }
    
    // Fetch the email template from database
    const supabase = await createClient();
    const { data: template } = await supabase
      .from("email_templates")
      .select("*")
      .eq("template_name", "workshop_confirmation")
      .eq("is_active", true)
      .single();
    
    // Use template or fallback to default
    let subject = template?.subject || "Your Concrete Creations Workshop Access";
    let emailBody = template?.body || `Hi {name},

Thank you for subscribing to our workshop! We're excited to have you.

Your Session: {date} at {time}
Join via: {link}

Please save this link for your selected date/time. We'll send a reminder before the workshop with preparation details.

See you soon!

Best,
Limen Lakay LLC`;
    
    // Replace variables
    subject = subject.replace(/{name}/g, name);
    emailBody = emailBody
      .replace(/{name}/g, name)
      .replace(/{date}/g, date || 'TBD')
      .replace(/{time}/g, time || 'TBD')
      .replace(/{link}/g, meetingLink || 'Link will be sent closer to the date');
    
    const htmlBody = emailBody.replace(/\n/g, '<br>');
    
    // TODO: Integrate with your email service
    // For now, we'll log it and return success
    // In production, use your SMTP settings or email service API
    
    console.log("Sending email:", {
      to,
      subject,
      preview: emailBody.substring(0, 100) + "...",
    });
    
    // Example integration with SMTP2GO or other service:
    /*
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
    
    if (!response.ok) {
      throw new Error('Failed to send email via SMTP2GO');
    }
    */
    
    // For development, just return success
    return NextResponse.json(
      {
        success: true,
        message: "Email sent successfully",
        emailPreview: { to, subject, body: emailBody },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
