import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Check if API key exists, otherwise use fallback responses
const hasApiKey = !!process.env.ANTHROPIC_API_KEY;
const anthropic = hasApiKey ? new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
}) : null;

const BUSINESS_CONTEXT = `You are a helpful customer service representative for Limen Lakay, a premium handcrafted concrete candle vessel company based in Palm Beach, Florida.

COMPANY INFORMATION:
- Business Name: Limen Lakay (means "Light at Home" in Haitian Creole)
- Founded: 2024
- Specialty: Handcrafted concrete candle vessels - each one uniquely crafted
- Contact: info@limenlakay.com | +1 (561) 593-0238
- Response Time: Within 24 hours
- Website: limenlakay.com

PRODUCTS & SERVICES:
1. Finished Candles:
   - Bèl Flè Candle (Beautiful Flower) - Gold Cobalt Blue/Metallic Gold Rounded Vessel - $39.99
   - Chimen Lakay Candle (Path Home) - Turquoise Cylindrical Vessel - $35.99
   - Premium soy wax candles in handmade concrete vessels
   - Each vessel is unique due to the handcrafted concrete pouring process

2. Empty Concrete Vessels:
   - Available in multiple shapes: Rounded, Cylindrical, Shallow, Scalloped
   - Colors: Gold, Blue, Turquoise, Off-White, Cream, Metallic finishes
   - Sizes: Small (8oz), Medium (12oz), Large (16oz)
   - Price Range: $16.99 - $49.99
   - Can be used as planters, home decor, or for custom candles

3. Custom Candle Orders:
   - Choose your vessel (shape, color, size)
   - Select from 20+ premium fragrances:
     * Holiday: Bèl Flè (Beautiful Flower), Krismay Lakay (Christmas at Home)
     * Autumn: Tranble (Trembling), Tonbe Fey (Falling Leaves)
     * Florals: Jaden Flè (Flower Garden), Roses & Mimosa
     * Fresh: Kawòt (Carrot), Citron & Lavender, Sea Salt & Sage
     * Fruits: Franbwaz Kokout (Raspberry Coconut), Berry Mix
     * Gourmet: Chokolat Vaniy (Chocolate Vanilla), Kannèl (Cinnamon)
   - Timeline: 5-7 business days for custom orders

4. Bulk Orders & Wholesale:
   - Wedding favors, corporate gifts, special events
   - Custom branding available
   - Volume discounts for 10+ units
   - Contact: info@limenlakay.com or use bulk order form

5. Candle Making Workshops:
   - Learn to create your own concrete vessel candles
   - Hands-on experience with artisan techniques
   - Group and private sessions available
   - Perfect for team building, parties, date nights

ORDERING INFORMATION:
- Standard Collections: Ships in 2-3 business days
- Custom Orders: 5-7 business days production time
- Local Delivery: Available in Palm Beach County area
- Shipping: Nationwide shipping available
- Payment: Secure checkout via Stripe
- Returns: 30-day satisfaction guarantee on finished candles

CARE INSTRUCTIONS:
- Trim wick to 1/4" before each use
- Burn for 2-3 hours minimum for even wax pool
- Concrete vessels are reusable - clean and repurpose after candle is finished
- Hand wash concrete with mild soap, pat dry
- Vessels may develop unique patina over time (this is normal and adds character)

FREQUENTLY ASKED QUESTIONS:
Q: Are the vessels really handmade?
A: Yes! Each concrete vessel is hand-poured and hand-finished by our artisan team. No two are exactly alike.

Q: Can I order just the vessel without a candle?
A: Absolutely! We sell empty vessels for use as planters, decor, or for making your own candles.

Q: How do I track my order?
A: Use your tracking number (format: LL-2024-XXX) in the Track Order tab of this chat widget.

Q: Do you offer custom fragrances?
A: For bulk orders of 10+ units, we can discuss custom fragrance blending. Contact us directly.

Q: Can I reuse the vessel?
A: Yes! Our concrete vessels are designed to be long-lasting. Once your candle burns down, clean it out and repurpose it.

TONE & STYLE:
- Friendly, warm, and professional
- Enthusiastic about our artisan craft
- Patient and helpful with all inquiries
- Use occasional Haitian Creole terms with English translations
- Emphasize the unique, handcrafted nature of products
- Encourage creativity and personalization

Always be helpful, accurate, and encouraging. If you don't know something specific, direct customers to contact info@limenlakay.com or call (561) 593-0238.`;

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Build conversation history for Claude
    const messages = [
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    // Use AI if available, otherwise use smart fallback
    let assistantMessage = '';
    
    if (anthropic && hasApiKey) {
      try {
        // Call Claude API
        const response = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          system: BUSINESS_CONTEXT,
          messages: messages
        });

        assistantMessage = response.content[0].type === 'text' 
          ? response.content[0].text 
          : 'I apologize, but I encountered an error. Please try again or contact us at info@limenlakay.com';
      } catch (aiError) {
        console.error('AI API error:', aiError);
        // Fall back to smart responses
        assistantMessage = getSmartFallbackResponse(message);
      }
    } else {
      // No API key, use smart fallback
      assistantMessage = getSmartFallbackResponse(message);
    }

    return NextResponse.json({
      success: true,
      message: assistantMessage,
      conversationHistory: [
        ...conversationHistory,
        { role: 'user', content: message },
        { role: 'assistant', content: assistantMessage }
      ]
    });

  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process message',
        message: 'Thank you for your message! Our team will respond within 24 hours. Contact us at info@limenlakay.com or (561) 593-0238.'
      },
      { status: 200 }
    );
  }
}

// Smart fallback responses when AI is not available
function getSmartFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Product inquiries
  if (lowerMessage.includes('candle') || lowerMessage.includes('product') || lowerMessage.includes('have')) {
    return `We offer premium handcrafted concrete candle vessels! Our collection includes:\n\n🕯️ **Finished Candles**:\n- Bèl Flè Candle: $39.99\n- Chimen Lakay Candle: $35.99\n\n🏺 **Empty Vessels**: $16.99 - $49.99\n- Multiple shapes & colors available\n\n✨ **Custom Orders**: Choose your vessel & fragrance!\n\nWhat interests you most? Our team at info@limenlakay.com can help with specific details!`;
  }
  
  // Pricing
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
    return `Our pricing:\n\n💰 **Finished Candles**: $35.99 - $39.99\n💰 **Empty Vessels**: $16.99 - $49.99\n💰 **Custom Candles**: Starting at $35\n\n**Bulk Orders**: Volume discounts for 10+ units!\n\nEmail info@limenlakay.com for exact quotes.`;
  }
  
  // Shipping/delivery
  if (lowerMessage.includes('ship') || lowerMessage.includes('deliver') || lowerMessage.includes('how long')) {
    return `📦 **Shipping Timeline**:\n- Standard collections: 2-3 business days\n- Custom orders: 5-7 business days\n- Local delivery available in Palm Beach County\n- Nationwide shipping\n\nNeed rush delivery? Contact us at (561) 593-0238!`;
  }
  
  // Fragrances
  if (lowerMessage.includes('scent') || lowerMessage.includes('fragrance') || lowerMessage.includes('smell')) {
    return `🌸 We offer 20+ premium fragrances:\n\n**Holiday**: Bèl Flè, Krismay Lakay\n**Autumn**: Tranble, Tonbe Fey\n**Florals**: Jaden Flè, Roses & Mimosa\n**Fresh**: Sea Salt & Sage, Citron & Lavender\n**Fruits**: Raspberry Coconut, Berry Mix\n**Gourmet**: Chocolate Vanilla, Cinnamon\n\nBrowse all fragrances on our custom order page!`;
  }
  
  // Workshops
  if (lowerMessage.includes('workshop') || lowerMessage.includes('class') || lowerMessage.includes('learn')) {
    return `🎨 **Candle Making Workshops**:\n- Learn to craft concrete vessel candles\n- Hands-on artisan techniques\n- Group & private sessions\n- Perfect for team building, parties, dates\n\nBook your workshop at limenlakay.com/workshop-subscription or call (561) 593-0238!`;
  }
  
  // Contact/help
  if (lowerMessage.includes('contact') || lowerMessage.includes('email') || lowerMessage.includes('phone')) {
    return `📞 **Contact Limen Lakay**:\n\n📧 Email: info@limenlakay.com\n📱 Phone: +1 (561) 593-0238\n🌐 Website: limenlakay.com\n\n⏱️ We respond within 24 hours!\n\nHow else can we help you today?`;
  }
  
  // Default response
  return `Thank you for contacting Limen Lakay! 🕯️\n\nI'd be happy to help you with:\n- Product information\n- Custom orders\n- Pricing & shipping\n- Workshops\n- Bulk orders\n\nOr contact us directly:\n📧 info@limenlakay.com\n📱 (561) 593-0238\n\nWhat would you like to know?`;
}
