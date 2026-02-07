import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Initialize Stripe only when needed
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
    });
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    const body = await request.text();
    const sig = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const { name, phone, workshopDate, packageType } = session.metadata!;
      const email = session.customer_email;
      const amountPaid = session.amount_total ? session.amount_total / 100 : 0;

      // Save booking to database
      const supabase = await createClient();
      
      const { error } = await supabase
        .from('workshop_bookings')
        .insert([
          {
            name,
            email,
            phone,
            workshop_date: workshopDate,
            package_type: packageType,
            package_price: amountPaid,
            status: 'confirmed',
            payment_status: 'paid',
            stripe_session_id: session.id,
            stripe_payment_intent: session.payment_intent as string,
          }
        ]);

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Failed to save booking' }, { status: 500 });
      }

      // Send confirmation email
      try {
        const metadata = session.metadata || {};
        // Check if this is a workshop booking or product order
        if (metadata.type === 'workshop') {
          // Fetch workshop session details
          const supabase = await createClient();
          const { data: sessionData } = await supabase
            .from('workshop_sessions')
            .select('session_date, session_time, meeting_link')
            .eq('id', workshopDate)
            .single();

          const sessionDate = sessionData ? new Date(sessionData.session_date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : workshopDate;
          const sessionTime = sessionData?.session_time || 'TBD';

          // Send email to CUSTOMER
          await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({
              to: email,
              subject: '🎨 Workshop Booking Confirmed - Limen Lakay',
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
                    <tr>
                      <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                          <!-- Header -->
                          <tr>
                            <td style="background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); padding: 40px 20px; text-align: center;">
                              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Workshop Confirmed! 🎉</h1>
                            </td>
                          </tr>
                          
                          <!-- Content -->
                          <tr>
                            <td style="padding: 40px 30px;">
                              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi ${name},</p>
                              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Thank you for booking a workshop with Limen Lakay! We're excited to guide you through creating your own concrete vessel.
                              </p>
                              
                              <table width="100%" cellpadding="15" style="background-color: #f97316; border-radius: 8px; margin: 20px 0;">
                                <tr>
                                  <td style="color: #ffffff; font-size: 18px; font-weight: bold; text-align: center;">
                                    📅 ${sessionDate}<br>
                                    🕐 ${sessionTime}
                                  </td>
                                </tr>
                              </table>
                              
                              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                                <strong>Booking Details:</strong><br>
                                Package: ${packageType === 'single' ? 'Single Workshop' : 'Monthly Subscription'}<br>
                                Amount Paid: $${amountPaid.toFixed(2)}<br>
                                Payment Status: ✅ Confirmed
                              </p>
                              
                              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                                We'll send you a reminder email before your workshop with:
                              </p>
                              <ul style="color: #333; font-size: 16px; line-height: 1.6;">
                                <li>Meeting link to join the session</li>
                                <li>Materials list (if any)</li>
                                <li>Preparation tips</li>
                              </ul>
                              
                              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                                If you have any questions before then, feel free to reach out to us at <a href="mailto:info@limenlakay.com" style="color: #f97316; text-decoration: none;">info@limenlakay.com</a>
                              </p>
                              
                              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
                                See you soon!<br>
                                <strong>The Limen Lakay Team</strong>
                              </p>
                            </td>
                          </tr>
                          
                          <!-- Footer -->
                          <tr>
                            <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                                Limen Lakay LLC | Handcrafted Concrete Vessels<br>
                                <a href="https://www.limenlakay.com" style="color: #f97316; text-decoration: none;">www.limenlakay.com</a>
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
              `,
            }),
          });

          // Send notification email to OWNER
          await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({
              to: 'info@limenlakay.com',
              subject: `🔔 New Workshop Booking: ${name}`,
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
                    <tr>
                      <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                          <tr>
                            <td style="background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); padding: 30px 20px; text-align: center;">
                              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">New Workshop Booking</h1>
                            </td>
                          </tr>
                          
                          <tr>
                            <td style="padding: 30px;">
                              <h2 style="color: #333; font-size: 20px; margin: 0 0 20px 0;">Booking Information</h2>
                              
                              <table width="100%" cellpadding="10" style="border: 1px solid #e5e7eb; border-radius: 8px;">
                                <tr>
                                  <td style="color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;"><strong>Customer Name:</strong></td>
                                  <td style="color: #333; font-size: 14px; border-bottom: 1px solid #e5e7eb;">${name}</td>
                                </tr>
                                <tr>
                                  <td style="color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;"><strong>Email:</strong></td>
                                  <td style="color: #333; font-size: 14px; border-bottom: 1px solid #e5e7eb;"><a href="mailto:${email}" style="color: #f97316; text-decoration: none;">${email}</a></td>
                                </tr>
                                <tr>
                                  <td style="color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;"><strong>Phone:</strong></td>
                                  <td style="color: #333; font-size: 14px; border-bottom: 1px solid #e5e7eb;">${phone}</td>
                                </tr>
                                <tr>
                                  <td style="color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;"><strong>Workshop Date:</strong></td>
                                  <td style="color: #333; font-size: 14px; border-bottom: 1px solid #e5e7eb;">${sessionDate} at ${sessionTime}</td>
                                </tr>
                                <tr>
                                  <td style="color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;"><strong>Package Type:</strong></td>
                                  <td style="color: #333; font-size: 14px; border-bottom: 1px solid #e5e7eb;">${packageType === 'single' ? 'Single Workshop' : 'Monthly Subscription'}</td>
                                </tr>
                                <tr>
                                  <td style="color: #6b7280; font-size: 14px;"><strong>Amount Paid:</strong></td>
                                  <td style="color: #16a34a; font-size: 18px; font-weight: bold;">$${amountPaid.toFixed(2)}</td>
                                </tr>
                              </table>
                              
                              <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0;">
                                <strong>Action Required:</strong> Review the booking in your admin panel and prepare workshop materials.
                              </p>
                            </td>
                          </tr>
                          
                          <tr>
                            <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                                This is an automated notification from Limen Lakay workshop booking system.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
              `,
            }),
          });
        } else {
          // Product order - use order email endpoint
          const { sku, productName } = metadata;
          await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({
              to: email,
              subject: 'Order Confirmation - Limen Lakay',
              html: `Order confirmed for ${productName || sku} - $${amountPaid.toFixed(2)}`,
            }),
          });
        }
      } catch (emailError) {
        console.error('Email error:', emailError);
        // Don't fail the webhook if email fails
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
