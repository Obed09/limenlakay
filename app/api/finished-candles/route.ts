import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: candles, error } = await supabase
      .from('finished_candles')
      .select(`
        id, 
        name, 
        sku, 
        price, 
        stock_quantity, 
        description, 
        image_url, 
        is_available,
        candle_scents(name),
        candle_vessels(name, color)
      `)
      .eq('is_available', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching finished candles:', error);
      return NextResponse.json({ candles: [], error: error.message }, { status: 500 });
    }

    // Transform the data to flatten scent and vessel names
    const transformedCandles = candles?.map(candle => ({
      ...candle,
      scent: candle.candle_scents?.name,
      vessel_name: candle.candle_vessels?.name,
      vessel_color: candle.candle_vessels?.color,
    })) || [];

    return NextResponse.json({ candles: transformedCandles });
  } catch (error) {
    console.error('Error in finished-candles API:', error);
    return NextResponse.json({ candles: [], error: 'Internal server error' }, { status: 500 });
  }
}
