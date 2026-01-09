import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: vessels, error } = await supabase
      .from('candle_vessels')
      .select('*')
      .order('sku');

    if (error) throw error;

    // Generate simple HTML for PDF
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Limen Lakay - Vessel Catalog</title>
  <style>
    body {
      font-family: 'Georgia', serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px;
      color: #333;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 3px solid #000;
      padding-bottom: 20px;
    }
    .header h1 {
      font-size: 36px;
      margin: 0;
      letter-spacing: 2px;
    }
    .header p {
      color: #666;
      font-style: italic;
    }
    .vessel-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 30px;
      margin-top: 30px;
    }
    .vessel-card {
      border: 1px solid #ddd;
      padding: 15px;
      page-break-inside: avoid;
    }
    .vessel-image {
      width: 100%;
      height: 250px;
      object-fit: cover;
      border-radius: 8px;
      margin-bottom: 15px;
    }
    .vessel-sku {
      font-weight: bold;
      color: #000;
      font-size: 14px;
      margin-bottom: 5px;
    }
    .vessel-name {
      font-size: 18px;
      font-weight: bold;
      margin: 10px 0;
    }
    .vessel-details {
      font-size: 12px;
      color: #666;
      margin: 5px 0;
    }
    .vessel-price {
      font-size: 20px;
      font-weight: bold;
      color: #2d7a3e;
      margin-top: 10px;
    }
    .vessel-description {
      font-size: 12px;
      line-height: 1.4;
      margin-top: 10px;
      font-style: italic;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      font-size: 12px;
      color: #999;
      border-top: 1px solid #ddd;
      padding-top: 20px;
    }
    @media print {
      .vessel-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>LIMEN LAKAY</h1>
    <p>Handmade Concrete Vessels Collection</p>
    <p style="font-size: 12px;">Catalog Generated: ${new Date().toLocaleDateString()}</p>
  </div>

  <div class="vessel-grid">
    ${vessels?.map(vessel => `
      <div class="vessel-card">
        <img src="${vessel.image_url}" alt="${vessel.name}" class="vessel-image" />
        <div class="vessel-sku">SKU: ${vessel.sku || 'N/A'}</div>
        <div class="vessel-name">${vessel.name}</div>
        <div class="vessel-details">${vessel.color} • Size ${vessel.size}</div>
        <div class="vessel-price">$${vessel.price.toFixed(2)}</div>
        ${vessel.description ? `<div class="vessel-description">${vessel.description}</div>` : ''}
        <div class="vessel-details" style="margin-top: 10px;">
          Stock: ${vessel.stock_quantity} | 
          ${vessel.is_available ? '<span style="color: green;">Available</span>' : '<span style="color: red;">Unavailable</span>'}
        </div>
      </div>
    `).join('')}
  </div>

  <div class="footer">
    <p><strong>Limen Lakay</strong> | www.limenlakay.com</p>
    <p>For orders and inquiries, please contact us</p>
  </div>
</body>
</html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="limen-lakay-catalog-${new Date().toISOString().split('T')[0]}.html"`,
      },
    });
  } catch (error: any) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate catalog' },
      { status: 500 }
    );
  }
}
