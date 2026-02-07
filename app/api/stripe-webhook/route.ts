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
      
      const metadata = session.metadata || {};
      const email = session.customer_email;
      const amountPaid = session.amount_total ? session.amount_total / 100 : 0;
      const supabase = await createClient();

      // Handle based on order type
      if (metadata.type === 'workshop') {
        // Workshop booking
        const { name, phone, workshopDate, packageType } = metadata;
        
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
      } else if (metadata.type === 'custom_order') {
        // Custom vessel/candle order
        const { customerName, customerPhone, shippingAddress, cartItems } = metadata;
        const parsedCartItems = JSON.parse(cartItems || '[]');
        
        // Calculate subtotal from cart items
        const subtotal = parsedCartItems.reduce((sum: number, item: any) => sum + item.unit_price, 0);
        const shippingCost = amountPaid - subtotal;
        
        // Generate order number
        const orderNumber = `ORD-${Date.now()}`;
        
        // Parse shipping address
        const addressParts = shippingAddress.split(', ');
        const [address, city, stateZip] = addressParts;
        const [state, zip] = stateZip ? stateZip.split(' ') : ['', ''];
        
        // Create order
        const { data: order, error: orderError } = await supabase
          .from('custom_orders')
          .insert([
            {
              order_number: orderNumber,
              customer_name: customerName,
              customer_email: email,
              customer_phone: customerPhone || '',
              shipping_address: address || shippingAddress,
              shipping_city: city || '',
              shipping_state: state || '',
              shipping_zip: zip || '',
              subtotal,
              shipping_cost: shippingCost,
              total: amountPaid,
              status: 'pending',
              payment_status: 'paid',
              stripe_session_id: session.id,
              stripe_payment_intent: session.payment_intent as string,
            }
          ])
          .select()
          .single();

        if (orderError) {
          console.error('Order database error:', orderError);
          return NextResponse.json({ error: 'Failed to save order' }, { status: 500 });
        }

        // Create order items
        const orderItems = parsedCartItems.map((item: any) => ({
          order_id: order.id,
          vessel_id: item.vessel_id,
          scent_id: item.scent_id,
          quantity: 1,
          unit_price: item.unit_price,
          subtotal: item.unit_price
        }));

        const { error: itemsError } = await supabase
          .from('custom_order_items')
          .insert(orderItems);

        if (itemsError) {
          console.error('Order items database error:', itemsError);
        }
      }

      // Send confirmation email
      try {
        if (metadata.type === 'workshop') {
          const { name, phone, workshopDate, packageType } = metadata;
          
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
        } else if (metadata.type === 'custom_order') {
          // Custom vessel/candle order
          const { customerName, customerPhone, shippingAddress, cartItems } = metadata;
          const parsedCartItems = JSON.parse(cartItems || '[]');
          
          // Build order items HTML
          const orderItemsHtml = parsedCartItems.map((item: any) => `
            <tr>
              <td style="color: #333; font-size: 14px; padding: 10px; border-bottom: 1px solid #e5e7eb;">
                ${item.vessel_name}${item.scent_name ? ` - ${item.scent_name}` : ' (Empty Vessel)'}
              </td>
              <td style="color: #333; font-size: 14px; padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">
                $${item.unit_price.toFixed(2)}
              </td>
            </tr>
          `).join('');

          // Send email to CUSTOMER
          await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({
              to: email,
              subject: '✅ Order Confirmed - Limen Lakay',
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
                            <td style="background: linear-gradient(135deg, #f97316 0%, #fb923c 100%); padding: 40px 20px; text-align: center;">
                              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Order Confirmed! 🎉</h1>
                            </td>
                          </tr>
                          
                          <tr>
                            <td style="padding: 40px 30px;">
                              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi ${customerName},</p>
                              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Thank you for your order! We're excited to prepare your handcrafted items.
                              </p>
                              
                              <h2 style="color: #f97316; font-size: 20px; margin: 30px 0 15px 0;">Order Details</h2>
                              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px;">
                                ${orderItemsHtml}
                                <tr>
                                  <td style="color: #333; font-size: 16px; padding: 15px; font-weight: bold; border-top: 2px solid #f97316;">Total Paid</td>
                                  <td style="color: #f97316; font-size: 18px; padding: 15px; text-align: right; font-weight: bold; border-top: 2px solid #f97316;">$${amountPaid.toFixed(2)}</td>
                                </tr>
                              </table>
                              
                              <h2 style="color: #f97316; font-size: 20px; margin: 30px 0 15px 0;">Shipping Address</h2>
                              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0; background-color: #f9fafb; padding: 15px; border-radius: 8px;">
                                ${shippingAddress}
                              </p>
                              
                              <h2 style="color: #f97316; font-size: 20px; margin: 30px 0 15px 0;">What's Next?</h2>
                              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 10px 0;">
                                📦 <strong>Production:</strong> Your items will be handcrafted within 5-7 business days<br>
                                🚚 <strong>Shipping:</strong> You'll receive tracking information once shipped<br>
                                💌 <strong>Updates:</strong> We'll email you at each step
                              </p>
                              
                              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
                                Questions? Contact us at <a href="mailto:info@limenlakay.com" style="color: #f97316; text-decoration: none;">info@limenlakay.com</a>
                              </p>
                              
                              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">
                                Thank you for supporting handcrafted artistry!<br>
                                <strong>The Limen Lakay Team</strong>
                              </p>
                            </td>
                          </tr>
                          
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
              subject: `🔔 New Custom Order: ${customerName}`,
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
                              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">New Custom Order</h1>
                            </td>
                          </tr>
                          
                          <tr>
                            <td style="padding: 30px;">
                              <h2 style="color: #333; font-size: 20px; margin: 0 0 20px 0;">Order Information</h2>
                              
                              <table width="100%" cellpadding="10" style="border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 20px;">
                                <tr>
                                  <td style="color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;"><strong>Customer Name:</strong></td>
                                  <td style="color: #333; font-size: 14px; border-bottom: 1px solid #e5e7eb;">${customerName}</td>
                                </tr>
                                <tr>
                                  <td style="color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;"><strong>Email:</strong></td>
                                  <td style="color: #333; font-size: 14px; border-bottom: 1px solid #e5e7eb;"><a href="mailto:${email}" style="color: #f97316; text-decoration: none;">${email}</a></td>
                                </tr>
                                <tr>
                                  <td style="color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;"><strong>Phone:</strong></td>
                                  <td style="color: #333; font-size: 14px; border-bottom: 1px solid #e5e7eb;">${customerPhone || 'Not provided'}</td>
                                </tr>
                                <tr>
                                  <td style="color: #6b7280; font-size: 14px;"><strong>Shipping Address:</strong></td>
                                  <td style="color: #333; font-size: 14px;">${shippingAddress}</td>
                                </tr>
                              </table>
                              
                              <h2 style="color: #333; font-size: 20px; margin: 20px 0 15px 0;">Order Items</h2>
                              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px;">
                                ${orderItemsHtml}
                                <tr>
                                  <td style="color: #333; font-size: 16px; padding: 15px; font-weight: bold; border-top: 2px solid #16a34a;">Total</td>
                                  <td style="color: #16a34a; font-size: 18px; padding: 15px; text-align: right; font-weight: bold; border-top: 2px solid #16a34a;">$${amountPaid.toFixed(2)}</td>
                                </tr>
                              </table>
                              
                              <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0;">
                                <strong>Action Required:</strong> Begin production of the custom items and update the order status in your admin panel.
                              </p>
                            </td>
                          </tr>
                          
                          <tr>
                            <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                                This is an automated notification from Limen Lakay order system.
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
