import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { images } = await request.json(); // Array of {name, url}
    
    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No images provided' },
        { status: 400 }
      );
    }

    if (images.length > 20) {
      return NextResponse.json(
        { success: false, error: 'Maximum 20 images allowed per batch' },
        { status: 400 }
      );
    }

    // Initialize OpenAI client only when needed
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Process each image with AI
    const results = await Promise.all(
      images.map(async (image: { name: string; url: string }) => {
        try {
          const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: `Analyze this candle vessel and provide:
1. Primary color (e.g., "Cream", "White", "Amber")
2. Short description (one sentence)
3. Shape type: cylinder, bowl, sphere, or scallop
4. Estimated diameter in inches
5. Estimated height in inches
6. Texture: ribbed, smooth, scalloped, or fluted

Respond ONLY with valid JSON in this exact format:
{
  "color": "color name",
  "description": "brief description",
  "shape": "shape type",
  "diameter": number,
  "height": number,
  "texture": "texture type",
  "style": "modern/classic/rustic"
}`
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: image.url,
                      detail: 'low'
                    }
                  }
                ]
              }
            ],
            max_tokens: 300,
            temperature: 0.5
          });

          const content = response.choices[0].message.content || '';
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          
          if (!jsonMatch) {
            throw new Error('No JSON found in response');
          }

          const analysis = JSON.parse(jsonMatch[0]);

          // Get mold suggestion
          const moldResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/suggest-mold`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              shape: analysis.shape,
              diameter: analysis.diameter,
              height: analysis.height,
              texture: analysis.texture
            })
          });

          const moldData = await moldResponse.json();

          return {
            success: true,
            fileName: image.name,
            imageUrl: image.url,
            analysis,
            suggestedMold: moldData.suggestedMold,
            confidence: moldData.confidence
          };
        } catch (error) {
          console.error(`Error analyzing ${image.name}:`, error);
          return {
            success: false,
            fileName: image.name,
            imageUrl: image.url,
            error: error instanceof Error ? error.message : 'Analysis failed'
          };
        }
      })
    );

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: images.length,
        successful: successful.length,
        failed: failed.length
      }
    });

  } catch (error) {
    console.error('Bulk analysis error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Bulk analysis failed' 
      },
      { status: 500 }
    );
  }
}
