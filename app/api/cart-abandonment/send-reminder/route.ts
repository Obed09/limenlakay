import { NextRequest, NextResponse } from 'next/server';

interface CartAbandonmentRequest {
  cartId: string;
  customerEmail: string;
  customerName?: string;
  cartItems: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
  cartValue: number;
  reminderType: 'first' | 'second' | 'final';
}

interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

/**
 * POST /api/cart-abandonment/send-reminder
 * Send cart abandonment reminder emails
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: CartAbandonmentRequest = await request.json();
    const { cartId, customerEmail, customerName, cartItems, cartValue, reminderType } = body;

    // Generate email content based on reminder type
    const emailTemplate = generateEmailTemplate(reminderType, {
      customerName,
      cartItems,
      cartValue,
      cartId
    });

    // In a real application, you would integrate with your email service here
    // Examples: SendGrid, Mailgun, AWS SES, etc.
    
    // Simulated email sending
    console.log('Sending cart abandonment email:', {
      to: customerEmail,
      subject: emailTemplate.subject,
      cartId,
      reminderType,
      cartValue
    });

    // TODO: Integrate with your email service
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // 
    // const msg = {
    //   to: customerEmail,
    //   from: 'hello@limenlakay.com',
    //   subject: emailTemplate.subject,
    //   html: emailTemplate.htmlContent,
    //   text: emailTemplate.textContent,
    // };
    // 
    // await sgMail.send(msg);

    // Update cart abandonment record in database
    // TODO: Update database with reminder sent timestamp
    
    return NextResponse.json({
      success: true,
      message: 'Cart abandonment reminder sent successfully',
      cartId,
      reminderType,
      sentAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error sending cart abandonment reminder:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to send cart abandonment reminder',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Generate email templates for cart abandonment reminders
 */
function generateEmailTemplate(
  reminderType: 'first' | 'second' | 'final',
  data: {
    customerName?: string;
    cartItems: { productId: string; productName: string; quantity: number; price: number; }[];
    cartValue: number;
    cartId: string;
  }
): EmailTemplate {
  const { customerName, cartItems, cartValue, cartId } = data;
  const customerGreeting = customerName || 'Valued Customer';
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(cartValue);

  const cartItemsList = cartItems
    .map(item => `• ${item.productName} (Qty: ${item.quantity}) - $${item.price.toFixed(2)}`)
    .join('\n');

  const recoveryLink = `${process.env.NEXT_PUBLIC_APP_URL}/cart/recover/${cartId}`;

  switch (reminderType) {
    case 'first':
      return {
        subject: 'You left something beautiful behind... ✨',
        htmlContent: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Complete Your Limen Lakay Order</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <img src="${process.env.NEXT_PUBLIC_APP_URL}/images/logo.png" alt="Limen Lakay" style="height: 60px;">
                </div>
                
                <h1 style="color: #2c3e50;">Hi ${customerGreeting},</h1>
                
                <p>We noticed you were interested in some of our beautiful handcrafted candles but didn't complete your order. No worries – we've saved your cart for you!</p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0;">Your Cart (${formattedValue}):</h3>
                  <div style="white-space: pre-line;">${cartItemsList}</div>
                </div>
                
                <p>These handcrafted pieces are made with love and attention to detail. Each candle tells a story and brings warmth to your space.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${recoveryLink}" style="background: #e67e22; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Complete Your Order</a>
                </div>
                
                <p style="font-size: 14px; color: #666;">This email was sent because you left items in your cart. If you don't want to receive these reminders, you can unsubscribe below.</p>
              </div>
            </body>
          </html>
        `,
        textContent: `
Hi ${customerGreeting},

We noticed you were interested in some of our beautiful handcrafted candles but didn't complete your order. No worries – we've saved your cart for you!

Your Cart (${formattedValue}):
${cartItemsList}

These handcrafted pieces are made with love and attention to detail. Each candle tells a story and brings warmth to your space.

Complete your order: ${recoveryLink}

This email was sent because you left items in your cart. If you don't want to receive these reminders, you can unsubscribe.

Best regards,
The Limen Lakay Team
        `
      };

    case 'second':
      return {
        subject: 'Still thinking about your Limen Lakay candles? 🕯️',
        htmlContent: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Don't Miss Out - Limen Lakay</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <img src="${process.env.NEXT_PUBLIC_APP_URL}/images/logo.png" alt="Limen Lakay" style="height: 60px;">
                </div>
                
                <h1 style="color: #2c3e50;">Hi ${customerGreeting},</h1>
                
                <p>Your beautiful candles are still waiting for you! We understand that sometimes life gets busy, but we didn't want you to miss out on these special pieces.</p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0;">Still in Your Cart (${formattedValue}):</h3>
                  <div style="white-space: pre-line;">${cartItemsList}</div>
                </div>
                
                <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; color: #2d5a2d;"><strong>💚 Why our customers love these candles:</strong></p>
                  <ul style="margin: 10px 0; padding-left: 20px; color: #2d5a2d;">
                    <li>Hand-poured with natural wax</li>
                    <li>Unique, artisan-crafted vessels</li>
                    <li>Long-lasting, clean burn</li>
                    <li>Perfect for creating ambiance</li>
                  </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${recoveryLink}" style="background: #27ae60; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Complete Your Order Now</a>
                </div>
                
                <p style="font-size: 12px; color: #999;">Free shipping on orders over $50 | 30-day return policy</p>
              </div>
            </body>
          </html>
        `,
        textContent: `
Hi ${customerGreeting},

Your beautiful candles are still waiting for you! We understand that sometimes life gets busy, but we didn't want you to miss out on these special pieces.

Still in Your Cart (${formattedValue}):
${cartItemsList}

Why our customers love these candles:
• Hand-poured with natural wax
• Unique, artisan-crafted vessels  
• Long-lasting, clean burn
• Perfect for creating ambiance

Complete your order: ${recoveryLink}

Free shipping on orders over $50 | 30-day return policy

Best regards,
The Limen Lakay Team
        `
      };

    case 'final':
      return {
        subject: 'Last chance - Your cart expires soon! ⏰',
        htmlContent: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Final Reminder - Limen Lakay</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <img src="${process.env.NEXT_PUBLIC_APP_URL}/images/logo.png" alt="Limen Lakay" style="height: 60px;">
                </div>
                
                <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                  <h2 style="margin: 0; color: #721c24;">⏰ Cart Expiring Soon!</h2>
                </div>
                
                <h1 style="color: #2c3e50;">Hi ${customerGreeting},</h1>
                
                <p><strong>This is your final reminder</strong> - the items in your cart will be released in 24 hours to ensure availability for other customers.</p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0;">Your Cart Will Expire (${formattedValue}):</h3>
                  <div style="white-space: pre-line;">${cartItemsList}</div>
                </div>
                
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; color: #8a6d3b;"><strong>🎁 Special offer just for you:</strong></p>
                  <p style="margin: 5px 0; color: #8a6d3b;">Use code <strong>COMEBACK10</strong> for 10% off your order!</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${recoveryLink}" style="background: #c0392b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Secure Your Candles Now</a>
                </div>
                
                <p style="font-size: 12px; color: #666; text-align: center;">Don't miss out on these beautiful handcrafted pieces!</p>
              </div>
            </body>
          </html>
        `,
        textContent: `
Hi ${customerGreeting},

CART EXPIRING SOON!

This is your final reminder - the items in your cart will be released in 24 hours to ensure availability for other customers.

Your Cart Will Expire (${formattedValue}):
${cartItemsList}

Special offer just for you:
Use code COMEBACK10 for 10% off your order!

Secure your candles now: ${recoveryLink}

Don't miss out on these beautiful handcrafted pieces!

Best regards,
The Limen Lakay Team
        `
      };

    default:
      throw new Error('Invalid reminder type');
  }
}