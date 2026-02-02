import { NextResponse } from "next/server";

/**
 * Order Email Service
 * Sends transactional emails to customers for order confirmations, shipping updates, etc.
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      to, 
      type, // 'confirmation', 'shipped', 'status_update'
      orderNumber,
      customerName,
      orderDetails,
      trackingNumber,
      total,
      shippingAddress
    } = body;
    
    if (!to || !type || !orderNumber) {
      return NextResponse.json(
        { error: "Missing required email fields" },
        { status: 400 }
      );
    }
    
    let subject = '';
    let htmlBody = '';
    
    switch (type) {
      case 'confirmation':
        subject = `Order Confirmation - ${orderNumber}`;
        htmlBody = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #d97706 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
              .order-info { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .items { margin: 20px 0; }
              .item { padding: 10px; border-bottom: 1px solid #e5e7eb; }
              .total { font-size: 1.2em; font-weight: bold; color: #d97706; margin-top: 15px; }
              .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 0.9em; }
              .button { display: inline-block; background: #d97706; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🕯️ Order Confirmed!</h1>
                <p>Thank you for your purchase from Limen Lakay</p>
              </div>
              
              <div class="content">
                <p>Hi ${customerName || 'Valued Customer'},</p>
                
                <p>Great news! We've received your order and we're getting started on creating your beautiful candles.</p>
                
                <div class="order-info">
                  <p><strong>Order Number:</strong> ${orderNumber}</p>
                  <p><strong>Order Total:</strong> $${total?.toFixed(2) || '0.00'}</p>
                  <p><strong>Shipping Address:</strong><br>${shippingAddress || 'As provided at checkout'}</p>
                </div>
                
                ${orderDetails ? `
                <div class="items">
                  <h3>Your Items:</h3>
                  ${orderDetails}
                </div>
                ` : ''}
                
                <h3>What Happens Next?</h3>
                <ol>
                  <li><strong>Crafting:</strong> We'll carefully handcraft your candles with premium ingredients</li>
                  <li><strong>Quality Check:</strong> Each candle is inspected to ensure it meets our standards</li>
                  <li><strong>Shipping:</strong> Once ready, we'll ship via UPS Ground and send you tracking info</li>
                  <li><strong>Delivery:</strong> Your candles will arrive at your doorstep ready to enjoy!</li>
                </ol>
                
                <center>
                  <a href="https://www.limenlakay.com" class="button">Visit Our Shop</a>
                </center>
                
                <p style="margin-top: 30px;">We'll send you another email with tracking information once your order ships. Most orders ship within 3-5 business days.</p>
              </div>
              
              <div class="footer">
                <p><strong>Questions about your order?</strong></p>
                <p>Email us at <a href="mailto:info@limenlakay.com" style="color: #d97706;">info@limenlakay.com</a></p>
                <p>or call (561) 593-0238</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p>Limen Lakay LLC | Premium Handcrafted Candles</p>
                <p><a href="https://www.limenlakay.com" style="color: #d97706;">www.limenlakay.com</a></p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;
        
      case 'shipped':
        subject = `Your Order Has Shipped! - ${orderNumber}`;
        htmlBody = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
              .tracking-box { background: #d1fae5; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center; }
              .tracking-number { font-size: 1.4em; font-weight: bold; color: #059669; font-family: monospace; letter-spacing: 1px; }
              .button { display: inline-block; background: #10b981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; margin: 15px 0; font-weight: bold; }
              .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 0.9em; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📦 Your Order Is On Its Way!</h1>
                <p>Order ${orderNumber} has shipped</p>
              </div>
              
              <div class="content">
                <p>Hi ${customerName || 'Valued Customer'},</p>
                
                <p>Exciting news! Your Limen Lakay candles have been carefully packaged and handed off to UPS for delivery.</p>
                
                ${trackingNumber ? `
                <div class="tracking-box">
                  <p style="margin: 0 0 10px 0; font-weight: bold; color: #059669;">UPS Tracking Number</p>
                  <div class="tracking-number">${trackingNumber}</div>
                  <center>
                    <a href="https://www.limenlakay.com/track-order" class="button">Track Your Package →</a>
                  </center>
                  <p style="margin-top: 15px; font-size: 0.9em; color: #6b7280;">
                    You can also track directly on UPS.com or enter the tracking number in our chat widget
                  </p>
                </div>
                ` : ''}
                
                <h3>Delivery Information:</h3>
                <ul>
                  <li><strong>Carrier:</strong> UPS Ground</li>
                  <li><strong>Estimated Delivery:</strong> 3-5 business days</li>
                  <li><strong>Shipping Address:</strong> ${shippingAddress || 'As provided at checkout'}</li>
                </ul>
                
                <h3>What to Expect:</h3>
                <p>Your candles are securely packaged to ensure they arrive in perfect condition. Once delivered, you can enjoy:</p>
                <ul>
                  <li>Premium soy wax blend for clean, long-lasting burns</li>
                  <li>Hand-poured with carefully selected fragrances</li>
                  <li>Eco-friendly ingredients and sustainable practices</li>
                </ul>
                
                <p style="margin-top: 30px;">Please allow 24 hours for tracking information to update with UPS.</p>
              </div>
              
              <div class="footer">
                <p><strong>Need Help?</strong></p>
                <p>Email us at <a href="mailto:info@limenlakay.com" style="color: #10b981;">info@limenlakay.com</a></p>
                <p>or call (561) 593-0238</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p>Limen Lakay LLC | Premium Handcrafted Candles</p>
                <p><a href="https://www.limenlakay.com" style="color: #10b981;">www.limenlakay.com</a></p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;
        
      case 'status_update':
        const statusData = body.statusDetails || {};
        subject = `Order Update - ${orderNumber}`;
        htmlBody = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
              .status-box { background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 0.9em; }
              .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📋 Order Status Update</h1>
                <p>Order ${orderNumber}</p>
              </div>
              
              <div class="content">
                <p>Hi ${customerName || 'Valued Customer'},</p>
                
                <p>We wanted to update you on the status of your Limen Lakay order.</p>
                
                <div class="status-box">
                  <p><strong>Current Status:</strong> ${statusData.status || 'In Progress'}</p>
                  ${statusData.message ? `<p>${statusData.message}</p>` : ''}
                </div>
                
                ${statusData.notes ? `
                <p><strong>Additional Information:</strong></p>
                <p>${statusData.notes}</p>
                ` : ''}
                
                <center>
                  <a href="mailto:info@limenlakay.com" class="button">Contact Us</a>
                </center>
              </div>
              
              <div class="footer">
                <p>Email us at <a href="mailto:info@limenlakay.com" style="color: #3b82f6;">info@limenlakay.com</a></p>
                <p>or call (561) 593-0238</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p>Limen Lakay LLC | Premium Handcrafted Candles</p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;
        
      default:
        return NextResponse.json(
          { error: "Invalid email type" },
          { status: 400 }
        );
    }
    
    // Send email using SMTP2GO via Supabase Edge Function
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('Supabase configuration missing');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email service not configured',
          preview: { to, subject, html: htmlBody }
        },
        { status: 200 }
      );
    }
    
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          to,
          subject,
          html: htmlBody,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        console.error('Email sending failed:', result);
        return NextResponse.json(
          { 
            success: false, 
            error: result.error || 'Failed to send email',
            preview: { to, subject }
          },
          { status: 200 } // Don't fail the order if email fails
        );
      }
      
      return NextResponse.json(
        {
          success: true,
          message: "Email sent successfully",
          emailType: type,
        },
        { status: 200 }
      );
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email service temporarily unavailable',
          preview: { to, subject }
        },
        { status: 200 } // Don't fail the order if email fails
      );
    }
  } catch (error) {
    console.error("Order email error:", error);
    return NextResponse.json(
      { error: "Failed to process email request" },
      { status: 500 }
    );
  }
}
