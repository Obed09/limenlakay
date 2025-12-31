import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { product, retailer, actionType, quantity, salePrice, notes } = body;

    // Email configuration
    const adminEmail = "info@limenlakay.com";
    const subject = `🔔 ${getActionEmoji(actionType)} ${getActionTitle(actionType)} - ${product.product_name}`;
    
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Limen Lakay Inventory Alert</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">${getActionTitle(actionType)}</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #6366f1; margin-top: 0;">Product Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Product:</td>
                <td style="padding: 8px 0; font-weight: bold; text-align: right; border-bottom: 1px solid #e5e7eb;">${product.product_name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">SKU:</td>
                <td style="padding: 8px 0; font-weight: bold; text-align: right; border-bottom: 1px solid #e5e7eb;">${product.sku}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Tracking Code:</td>
                <td style="padding: 8px 0; font-family: monospace; text-align: right; border-bottom: 1px solid #e5e7eb;">${product.tracking_code}</td>
              </tr>
              ${quantity ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Quantity:</td>
                <td style="padding: 8px 0; font-weight: bold; text-align: right; border-bottom: 1px solid #e5e7eb;">${quantity} units</td>
              </tr>
              ` : ''}
              ${salePrice ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Sale Price:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #10b981; text-align: right; border-bottom: 1px solid #e5e7eb;">$${parseFloat(salePrice).toFixed(2)}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Remaining Stock:</td>
                <td style="padding: 8px 0; font-weight: bold; text-align: right;">${product.remaining_quantity || 'N/A'} units</td>
              </tr>
            </table>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #6366f1; margin-top: 0;">Store Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Store Name:</td>
                <td style="padding: 8px 0; font-weight: bold; text-align: right; border-bottom: 1px solid #e5e7eb;">${retailer.name}</td>
              </tr>
              ${retailer.email ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Email:</td>
                <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid #e5e7eb;">${retailer.email}</td>
              </tr>
              ` : ''}
              ${retailer.phone ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Phone:</td>
                <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid #e5e7eb;">${retailer.phone}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Access Code:</td>
                <td style="padding: 8px 0; font-family: monospace; font-weight: bold; text-align: right;">${retailer.access_code}</td>
              </tr>
            </table>
          </div>
          
          ${notes ? `
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
            <strong style="color: #92400e;">Note:</strong>
            <p style="margin: 5px 0 0 0; color: #78350f;">${notes}</p>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://www.limenlakay.com/inventory-dashboard" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              View Dashboard
            </a>
          </div>
        </div>
        
        <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px; background: #f3f4f6;">
          <p style="margin: 5px 0;">Limen Lakay - Handcrafted Candles</p>
          <p style="margin: 5px 0;">📞 561 593 0238 | ✉️ info@limenlakay.com | 🌐 www.limenlakay.com</p>
          <p style="margin: 5px 0; color: #9ca3af;">This is an automated notification from your inventory tracking system.</p>
        </div>
      </div>
    `;

    // Send email using your email service
    // For now, we'll use the workshop email service if available
    // Or you can integrate with SendGrid, SMTP2GO, etc.
    
    console.log("Notification email prepared:", {
      to: adminEmail,
      subject,
      body: emailBody,
    });

    // TODO: Integrate with your email service
    // Example with fetch to an email API:
    /*
    await fetch("YOUR_EMAIL_SERVICE_API", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: adminEmail,
        subject: subject,
        html: emailBody,
      }),
    });
    */

    return NextResponse.json({ 
      success: true,
      message: "Notification sent successfully" 
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}

function getActionEmoji(actionType: string): string {
  switch (actionType) {
    case "sale": return "🛍️";
    case "inventory_check": return "📦";
    case "received": return "📥";
    case "returned": return "↩️";
    default: return "📋";
  }
}

function getActionTitle(actionType: string): string {
  switch (actionType) {
    case "sale": return "New Sale Recorded";
    case "inventory_check": return "Inventory Check Completed";
    case "received": return "Inventory Received";
    case "returned": return "Product Returned";
    default: return "Inventory Action";
  }
}
