import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { shape, diameter, height, texture } = await request.json();

    const supabase = await createClient();
    
    // Get all active molds
    const { data: molds } = await supabase
      .from('candle_molds')
      .select('*')
      .eq('is_active', true);

    if (!molds || molds.length === 0) {
      return NextResponse.json({ error: 'No molds available' }, { status: 404 });
    }

    // Find best matching mold based on shape, dimensions, and texture
    let bestMatch = molds[0];
    let bestScore = 0;

    for (const mold of molds) {
      let score = 0;

      // Shape match (highest priority)
      if (mold.shape_type === shape) {
        score += 50;
      }

      // Texture/style match
      if (texture && mold.style_tags) {
        const textureMatch = mold.style_tags.some((tag: string) => 
          tag.toLowerCase().includes(texture.toLowerCase()) || 
          texture.toLowerCase().includes(tag.toLowerCase())
        );
        if (textureMatch) score += 30;
      }

      // Diameter proximity (within 20%)
      if (diameter && mold.diameter_inches) {
        const diameterDiff = Math.abs(parseFloat(diameter) - parseFloat(mold.diameter_inches.toString()));
        const diameterPercent = diameterDiff / parseFloat(mold.diameter_inches.toString());
        if (diameterPercent < 0.2) {
          score += (1 - diameterPercent) * 20;
        }
      }

      // Height proximity (within 20%)
      if (height && mold.height_inches) {
        const heightDiff = Math.abs(parseFloat(height) - parseFloat(mold.height_inches.toString()));
        const heightPercent = heightDiff / parseFloat(mold.height_inches.toString());
        if (heightPercent < 0.2) {
          score += (1 - heightPercent) * 20;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = mold;
      }
    }

    return NextResponse.json({
      success: true,
      suggestedMold: bestMatch,
      confidence: Math.min(bestScore, 100),
      allMolds: molds, // Send all molds for dropdown
    });
  } catch (error: any) {
    console.error('Mold Suggestion Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to suggest mold' },
      { status: 500 }
    );
  }
}
