import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/products/export-csv
 * Exports products to CSV format for TikTok Shop, Etsy, or other platforms
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get('platform') || 'generic'; // 'tiktok', 'etsy', 'generic'

  try {
    const supabase = await createClient();

    // Fetch products from database
    const { data: vessels, error: vesselError } = await supabase
      .from('candle_vessels')
      .select('*')
      .eq('is_available', true);

    const { data: scents, error: scentError } = await supabase
      .from('candle_scents')
      .select('*')
      .eq('is_available', true);

    const { data: finishedCandles, error: candleError } = await supabase
      .from('finished_candles')
      .select('*')
      .eq('is_available', true);

    if (vesselError || scentError || candleError) {
      throw new Error('Error fetching products');
    }

    // Combine all products
    const allProducts = [
      ...(vessels || []).map(v => ({
        id: v.id,
        sku: `VESSEL-${v.color}-${v.size}`,
        name: v.name,
        description: v.description || `Beautiful ${v.color} vessel for candles`,
        price: v.price,
        category: 'Candle Vessels',
        image_url: v.image_url,
        stock: v.stock_quantity,
        type: 'vessel'
      })),
      ...(finishedCandles || []).map(c => ({
        id: c.id,
        sku: c.sku,
        name: c.name,
        description: c.description,
        price: c.price,
        category: 'Finished Candles',
        image_url: c.image_url,
        stock: c.stock_quantity,
        type: 'candle'
      }))
    ];

    // Generate CSV based on platform
    let csv = '';
    
    if (platform === 'tiktok') {
      // TikTok Shop CSV format
      csv = 'SKU,Product Name,Description,Price,Category,Image URL,Stock Quantity\n';
      allProducts.forEach(p => {
        csv += `"${p.sku}","${p.name}","${p.description}","${p.price}","${p.category}","${p.image_url}","${p.stock}"\n`;
      });
    } else if (platform === 'etsy') {
      // Etsy CSV format (simplified)
      csv = 'SKU,Title,Description,Price,Quantity,Tags,Category,Image 1\n';
      allProducts.forEach(p => {
        const tags = p.type === 'vessel' ? 'candle vessel, home decor, handmade' : 'candle, handmade candle, soy candle';
        csv += `"${p.sku}","${p.name}","${p.description}","${p.price}","${p.stock}","${tags}","${p.category}","${p.image_url}"\n`;
      });
    } else {
      // Generic CSV format
      csv = 'ID,SKU,Name,Description,Price,Category,Image URL,Stock,Type\n';
      allProducts.forEach(p => {
        csv += `"${p.id}","${p.sku}","${p.name}","${p.description}","${p.price}","${p.category}","${p.image_url}","${p.stock}","${p.type}"\n`;
      });
    }

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="limen-lakay-products-${platform}.csv"`
      }
    });

  } catch (error) {
    console.error('Error exporting products:', error);
    return NextResponse.json(
      { error: 'Failed to export products' },
      { status: 500 }
    );
  }
}
