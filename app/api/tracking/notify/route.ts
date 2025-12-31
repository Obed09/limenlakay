import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { product, retailer, actionType, quantity, salePrice, notes } = body;

    // Telegram configuration
    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;
    
    const subject = `🔔 ${getActionEmoji(actionType)} ${getActionTitle(actionType)} - ${product.product_name}`;
    
    // Create Telegram message
    const telegramMessage = `
🔔 *${getActionTitle(actionType)}*

📦 *Product Information*
━━━━━━━━━━━━━━━━
🏷️ Product: ${product.product_name}
📋 SKU: \`${product.sku}\`
🔗 Tracking: \`${product.tracking_code}\`${quantity ? `
📊 Quantity: ${quantity} units` : ''}${salePrice ? `
💵 Sale Price: $${parseFloat(salePrice).toFixed(2)}` : ''}
📦 Remaining: ${product.remaining_quantity || 'N/A'} units

🏪 *Store Information*
━━━━━━━━━━━━━━━━
🏬 Store: ${retailer.name}${retailer.email ? `
📧 Email: ${retailer.email}` : ''}${retailer.phone ? `
📞 Phone: ${retailer.phone}` : ''}
🔑 Code: \`${retailer.access_code}\`${notes ? `

📝 *Note:*
${notes}` : ''}

🔗 [View Dashboard](https://www.limenlakay.com/inventory-dashboard)

━━━━━━━━━━━━━━━━
🕯️ Limen Lakay | 561 593 0238
`;

    // Send Telegram notification
    if (telegramBotToken && telegramChatId) {
      try {
        const telegramResponse = await fetch(
          `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: telegramChatId,
              text: telegramMessage,
              parse_mode: "Markdown",
              disable_web_page_preview: false,
            }),
          }
        );

        const telegramData = await telegramResponse.json();
        
        if (!telegramData.ok) {
          console.error("Telegram API error:", telegramData);
        }
      } catch (error) {
        console.error("Error sending Telegram notification:", error);
      }
    } else {
      console.log("Telegram not configured. Message prepared:", telegramMessage);
    }

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
