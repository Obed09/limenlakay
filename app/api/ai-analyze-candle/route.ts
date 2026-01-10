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
              text: `Analyze this finished candle product image and provide:
1. Product name (if visible on label, otherwise create a descriptive name)
2. Vessel color (one word, capitalize first letter)
3. Vessel shape description
4. Scent name (if visible on label or can be inferred)
5. A 2-3 sentence product description
6. Style keywords (e.g., Modern, Rustic, Elegant)
7. Suggested retail price in dollars

Format your response as JSON:
{
  "name": "Lavender Bliss Candle",
  "vesselColor": "Cream",
  "vesselShape": "Scalloped bowl",
  "scent": "Lavender",
  "description": "Beautiful description here",
  "style": "Modern, Elegant",
  "suggestedPrice": 49
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
      // Fallback: default values
      analysisData = {
        name: 'Handmade Candle',
        vesselColor: 'Cream',
        vesselShape: 'Bowl',
        scent: 'Unscented',
        description: 'Beautiful handmade candle in a decorative vessel.',
        style: 'Modern',
        suggestedPrice: 45
      };
    }

    return NextResponse.json({
      success: true,
      analysis: analysisData
    });
    } catch (openaiError: any) {
      console.error('OpenAI initialization error:', openaiError);
      return NextResponse.json(
        { error: 'AI service temporarily unavailable' },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('AI Analysis Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Analysis failed'
      },
      { status: 500 }
    );
  }
}
