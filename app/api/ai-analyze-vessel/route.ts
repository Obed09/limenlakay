import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Initialize OpenAI client only when needed
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    try {
      // Dynamic import to prevent build-time errors
      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

    // Call OpenAI GPT-4 Vision API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this handmade concrete vessel image and provide:
1. Primary color (one word, capitalize first letter)
2. A 2-3 sentence poetic description suitable for product listing
3. Shape analysis: Is it a cylinder, bowl, sphere, or scalloped/flower shape?
4. Estimated diameter in inches (approximate visual measurement)
5. Estimated height in inches (approximate visual measurement)
6. Texture: Is it ribbed/fluted, smooth, or scalloped?
7. Style keywords (comma-separated, max 3 words like: Modern, Rustic, Elegant)

Format your response as JSON:
{
  "color": "Blue",
  "description": "Beautiful description here",
  "shape": "cylinder",
  "diameter": "3.1",
  "height": "1.4",
  "texture": "ribbed",
  "style": "Modern, Elegant"
}`,
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
      max_tokens: 300,
    });

    const content = response.choices[0].message.content;
    
    // Parse JSON from response
    let analysisData;
    try {
      // Extract JSON from response (sometimes GPT wraps it in markdown)
      const jsonMatch = content?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      // Fallback: manual parsing or default values
      analysisData = {
        color: 'Multi-colored',
        description: 'Beautifully crafted handmade concrete vessel with unique artistic patterns.',
        shape: 'cylinder',
        diameter: '3.5',
        height: '2.0',
        texture: 'smooth',
        style: 'Artisan, Handmade',
      };
    }

    return NextResponse.json({
      success: true,
      analysis: analysisData,
    });
    } catch (openaiError: any) {
      console.error('OpenAI initialization error:', openaiError);
      return NextResponse.json(
        { error: 'AI service temporarily unavailable' },
        { status: 503 }
      );
    }
  } catch (error: any) {
    console.error('AI Analysis Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
