import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const availableOnly = searchParams.get('available') === 'true';

    // Try to include image variants; gracefully fall back if table doesn't exist yet
    let data: Record<string, unknown>[] | null = null;

    if (availableOnly) {
      const withImages = await supabase
        .from('candle_vessels')
        .select('*, vessel_images(id, image_url, color_variant, is_primary, display_order, is_available)')
        .eq('is_available', true)
        .gt('stock_quantity', 0)
        .order('name');
      if (!withImages.error) {
        data = withImages.data as Record<string, unknown>[];
      } else {
        const fallback = await supabase.from('candle_vessels').select('*').eq('is_available', true).gt('stock_quantity', 0).order('name');
        if (fallback.error) return NextResponse.json({ error: fallback.error.message }, { status: 500 });
        data = fallback.data as Record<string, unknown>[];
      }
    } else {
      const withImages = await supabase
        .from('candle_vessels')
        .select('*, vessel_images(id, image_url, color_variant, is_primary, display_order, is_available)')
        .order('name');
      if (!withImages.error) {
        data = withImages.data as Record<string, unknown>[];
      } else {
        const fallback = await supabase.from('candle_vessels').select('*').order('name');
        if (fallback.error) return NextResponse.json({ error: fallback.error.message }, { status: 500 });
        data = fallback.data as Record<string, unknown>[];
      }
    }

    return NextResponse.json({ vessels: data });
  } catch (error) {
    console.error('Error in GET /api/vessels:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const {
      name,
      color,
      size,
      price,
      image_url,
      stock_quantity,
      is_available,
      description
    } = body;

    // Validate required fields
    if (!name || !color || !size || !price || !image_url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('candle_vessels')
      .insert([
        {
          name,
          color,
          size,
          price,
          image_url,
          stock_quantity: stock_quantity || 0,
          is_available: is_available !== undefined ? is_available : true,
          description
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating vessel:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, vessel: data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/vessels:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { vessel_id, ...updateData } = body;

    if (!vessel_id) {
      return NextResponse.json(
        { error: 'Vessel ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('candle_vessels')
      .update(updateData)
      .eq('id', vessel_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating vessel:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, vessel: data });
  } catch (error) {
    console.error('Error in PATCH /api/vessels:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const vessel_id = searchParams.get('id');

    if (!vessel_id) {
      return NextResponse.json(
        { error: 'Vessel ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('candle_vessels')
      .delete()
      .eq('id', vessel_id);

    if (error) {
      console.error('Error deleting vessel:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/vessels:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
