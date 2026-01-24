import { NextRequest, NextResponse } from 'next/server'

// AI Vision Media Analysis for Auto-Tagging
// Uses GPT-4 Vision to analyze uploaded images and suggest metadata tags

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      )
    }

    // Initialize OpenAI client
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const OpenAI = (await import('openai')).default
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Call GPT-4 Vision for comprehensive media analysis
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are analyzing a photo for a handcrafted candle and concrete vessel business.

Analyze this image and suggest tags in the following categories:

1. **Content Type** (choose ONE):
   - process (behind-the-scenes making)
   - finished_piece (final product)
   - studio (workspace/studio shot)
   - pour (wax pouring action)
   - vessel_shaping (shaping concrete)
   - packaging (packaged product)
   - lighting (lit candle)
   - lifestyle (candle in use/styled)

2. **Product Type** (choose ONE):
   - candle (finished candle)
   - vessel (empty vessel)
   - both

3. **Mood** (choose 1-3 that apply):
   - warm, earthy, minimal, luxury, ritual, calm

4. **Color Palette** (list 2-4 dominant colors):
   - Examples: amber, cream, terracotta, black, white, blue, green, gold, silver, beige

5. **Materials Visible** (list what you see):
   - concrete, soy_wax, wood, coconut_wax, terracotta, metal, fabric, paper

6. **Scent Profile** (if you can infer from visual cues like flowers, herbs, etc.):
   - floral, citrus, earthy, spicy, fruity, clean, gourmand
   - Or: "unknown" if no visual clues

7. **Suggested Caption Hook** (1 sentence to highlight in social post):
   - Example: "Sunday morning studio session" or "The first light of Lavender Dreams"

8. **Story Context Suggestion** (1 sentence about what makes this moment special):
   - Example: "Made during a rainy weekend when inspiration struck"

Format your response as JSON:
{
  "content_type": "process",
  "product_type": "candle",
  "mood": ["warm", "ritual"],
  "color_palette": ["cream", "amber", "terracotta"],
  "materials_used": ["concrete", "soy_wax"],
  "scent_profile": ["floral", "earthy"],
  "caption_hook": "Sunday morning in the studio",
  "story_context": "Each piece begins with intention and patience",
  "confidence": "high"
}

Be specific and realistic. If you cannot determine something, use "unknown" or empty array.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
      temperature: 0.3, // Lower temperature for more consistent analysis
    })

    // Parse response
    const content = response.choices[0].message.content || ''
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response as JSON')
    }

    const analysis = JSON.parse(jsonMatch[0])

    return NextResponse.json({
      success: true,
      analysis: analysis,
      raw_response: content
    })

  } catch (error: any) {
    console.error('AI Vision Analysis Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to analyze image',
        details: error.toString()
      },
      { status: 500 }
    )
  }
}
