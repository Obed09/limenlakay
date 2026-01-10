import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { sku, name, url } = await request.json();

    if (!sku) {
      return NextResponse.json(
        { success: false, error: 'SKU is required' },
        { status: 400 }
      );
    }

    // Generate QR code as data URL using dynamic import
    const QRCode = await import('qrcode');
    const qrCodeUrl = await QRCode.default.toDataURL(url || `https://limenlakay.com/vessel/${sku}`, {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    return NextResponse.json({
      success: true,
      qrCode: qrCodeUrl,
      barcode: sku, // Use SKU as barcode value
      productName: name
    });

  } catch (error) {
    console.error('Label generation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate label' 
      },
      { status: 500 }
    );
  }
}
