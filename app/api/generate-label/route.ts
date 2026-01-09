import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function POST(request: NextRequest) {
  try {
    const { sku, name, url } = await request.json();

    if (!sku) {
      return NextResponse.json(
        { success: false, error: 'SKU is required' },
        { status: 400 }
      );
    }

    // Generate QR code as data URL
    const qrCodeUrl = await QRCode.toDataURL(url || `https://limenlakay.com/vessel/${sku}`, {
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
