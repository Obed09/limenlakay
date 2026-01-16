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
  
  // Greetings - keep it brief and welcoming
  if (lowerMessage.match(/^(hi|hello|hey|good morning|good afternoon|good evening|greetings)[\s!.]*$/i)) {
    return `Hello! Thanks for reaching out to Limen Lakay. 🕯️\n\nI'm here to help with:\n• Product information\n• Custom orders & pricing\n• Shipping & delivery\n• Workshops\n\nWhat can I assist you with today?`;
  }
  
  // Simple acknowledgments
  if (lowerMessage.match(/^(thanks|thank you|ok|okay|got it|great)[\s!.]*$/i)) {
    return `You're welcome! Is there anything else you'd like to know about our handcrafted concrete candle vessels?`;
  }
  
  // Product inquiries - specific
  if (lowerMessage.includes('candle') && (lowerMessage.includes('how many') || lowerMessage.includes('which') || lowerMessage.includes('what'))) {
    return `We currently have 2 signature finished candles:\n\n**Bèl Flè Candle** - $39.99\nGold & blue metallic rounded vessel\n\n**Chimen Lakay Candle** - $35.99\nTurquoise cylindrical vessel\n\nPlus custom candles where you choose the vessel & fragrance!\n\nInterested in any of these?`;
  }
  
  // General product inquiry
  if (lowerMessage.includes('candle') || lowerMessage.includes('product') || lowerMessage.includes('sell') || lowerMessage.includes('offer')) {
    return `We specialize in handcrafted concrete candle vessels:\n\n**Finished Candles**: $35.99-$39.99\nReady to enjoy with premium soy wax\n\n**Empty Vessels**: $16.99-$49.99\nFor decor, plants, or DIY candles\n\n**Custom Orders**: Choose your vessel + fragrance\n\nWhat interests you?`;
  }
  
  // Pricing - direct and clear
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much') || lowerMessage.includes('$')) {
    return `Our pricing:\n\n• Finished candles: $35.99-$39.99\n• Empty vessels: $16.99-$49.99\n• Custom candles: Starting at $35\n\n*Bulk orders (10+): Volume discounts available*\n\nNeed a specific quote? Email info@limenlakay.com`;
  }
  
  // Shipping/delivery - concise
  if (lowerMessage.includes('ship') || lowerMessage.includes('deliver') || lowerMessage.includes('how long') || lowerMessage.includes('when')) {
    return `**Delivery Timeline:**\n\n• In-stock items: 2-3 business days\n• Custom orders: 5-7 business days\n• Local delivery: Available in Palm Beach County\n\nNeed rush shipping? Call us at (561) 593-0238`;
  }
  
  // Fragrances - organized list
  if (lowerMessage.includes('scent') || lowerMessage.includes('fragrance') || lowerMessage.includes('smell') || lowerMessage.includes('aroma')) {
    return `We offer 20+ premium fragrances:\n\n**Popular Collections:**\n• Holiday: Bèl Flè, Krismay Lakay\n• Fresh: Sea Salt & Sage, Lavender\n• Gourmet: Vanilla, Cinnamon\n• Floral: Roses, Mimosa\n\nBrowse all scents on our Custom Order page or ask for recommendations!`;
  }
  
  // Workshops - clear call to action
  if (lowerMessage.includes('workshop') || lowerMessage.includes('class') || lowerMessage.includes('learn') || lowerMessage.includes('make')) {
    return `**Candle Making Workshops** 🎨\n\nLearn to craft your own concrete vessel candles!\n\n• Hands-on instruction\n• All materials included\n• Group & private sessions\n• Perfect for events, team building\n\nBook at limenlakay.com/workshop-subscription or call (561) 593-0238`;
  }
  
  // Custom orders
  if (lowerMessage.includes('custom') || lowerMessage.includes('personalize') || lowerMessage.includes('design')) {
    return `**Custom Candle Orders:**\n\n1. Choose your concrete vessel (shape, color, size)\n2. Select from 20+ premium fragrances\n3. Ready in 5-7 business days\n\nStart your custom order at limenlakay.com/custom-order or contact us for guidance!`;
  }
  
  // Bulk orders
  if (lowerMessage.includes('bulk') || lowerMessage.includes('wholesale') || lowerMessage.includes('wedding') || lowerMessage.includes('event') || lowerMessage.includes('corporate')) {
    return `**Bulk & Wholesale Orders:**\n\n• Volume discounts for 10+ units\n• Custom branding available\n• Perfect for weddings, corporate gifts, events\n\nEmail info@limenlakay.com with your requirements for a personalized quote.`;
  }
  
  // Contact/help - direct
  if (lowerMessage.includes('contact') || lowerMessage.includes('email') || lowerMessage.includes('phone') || lowerMessage.includes('call')) {
    return `**Contact Us:**\n\n📧 info@limenlakay.com\n📱 (561) 593-0238\n🌐 limenlakay.com\n\n*We respond within 24 hours*\n\nPrefer to chat? Just ask your question here!`;
  }
  
  // Vessels only
  if (lowerMessage.includes('vessel') || lowerMessage.includes('empty') || lowerMessage.includes('container') || lowerMessage.includes('pot')) {
    return `**Empty Concrete Vessels:** $16.99-$49.99\n\n• Multiple shapes: Rounded, Cylindrical, Shallow, Scalloped\n• Colors: Gold, Blue, Turquoise, Cream, Metallic\n• Sizes: Small (8oz) to Large (16oz)\n\nUse as planters, decor, or make your own candles!\n\nView all at limenlakay.com/custom-order`;
  }
  
  // Default response - helpful and brief
  return `Thanks for contacting Limen Lakay! 🕯️\n\nI can help you with:\n• Products & pricing\n• Custom orders\n• Shipping info\n• Workshops & bulk orders\n\n**Quick contact:**\n📧 info@limenlakay.com | 📱 (561) 593-0238\n\nWhat would you like to know?`;
}
