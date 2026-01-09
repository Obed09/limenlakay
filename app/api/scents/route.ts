import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const availableOnly = searchParams.get('available') === 'true';

    let query = supabase
      .from('candle_scents')
      .select('*')
      .order('display_order');

    if (availableOnly) {
      query = query.eq('is_available', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching scents:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ scents: data });
  } catch (error) {
    console.error('Error in GET /api/scents:', error);
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
      name_english,
      notes,
      description,
      is_available,
      display_order
    } = body;

    // Validate required fields
    if (!name || !name_english || !notes || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('candle_scents')
      .insert([
        {
          name,
          name_english,
          notes,
          description,
          is_available: is_available !== undefined ? is_available : true,
          display_order: display_order || 0
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating scent:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, scent: data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/scents:', error);
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
    const { scent_id, ...updateData } = body;

    if (!scent_id) {
      return NextResponse.json(
        { error: 'Scent ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('candle_scents')
      .update(updateData)
      .eq('id', scent_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating scent:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, scent: data });
  } catch (error) {
    console.error('Error in PATCH /api/scents:', error);
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
    const scent_id = searchParams.get('id');

    if (!scent_id) {
      return NextResponse.json(
        { error: 'Scent ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('candle_scents')
      .delete()
      .eq('id', scent_id);

    if (error) {
      console.error('Error deleting scent:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/scents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
