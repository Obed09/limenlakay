import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Initialize Stripe only when needed
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
    });

    // Check if this is a product checkout or workshop checkout
    if (body.productName && body.sku) {
      // Product Checkout Flow
      const { productName, sku, price, shipping, quantity, customerInfo, paymentOption } = body;

      const lineItems = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
              description: `SKU: ${sku}`,
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: quantity || 1,
        },
      ];

      // Add shipping as a separate line item if provided
      if (shipping) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Standard Shipping',
              description: 'UPS Ground Shipping',
            },
            unit_amount: Math.round(shipping * 100), // Convert to cents
          },
          quantity: 1,
        });
      }

      // Configure session based on payment option and total amount
      const totalAmount = (price * (quantity || 1)) + (shipping || 0);
      const sessionConfig: any = {
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://limenlakay.com'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://limenlakay.com'}/checkout?product=${encodeURIComponent(productName)}&sku=${encodeURIComponent(sku)}&price=${price}`,
        customer_email: customerInfo.email,
        metadata: {
          type: 'product',
          sku: sku,
          productName: productName,
          customerName: customerInfo.name,
          customerPhone: customerInfo.phone || '',
          shippingAddress: `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} ${customerInfo.zip}`,
          paymentOption: paymentOption || 'card',
        },
        shipping_address_collection: {
          allowed_countries: ['US'],
        },
      };

      // Enable Affirm for orders over $110 (Affirm's minimum)
      if (paymentOption === 'affirm' && totalAmount >= 110) {
        sessionConfig.payment_method_types = ['card', 'affirm'];
      } else {
        sessionConfig.payment_method_types = ['card'];
      }

      const session = await stripe.checkout.sessions.create(sessionConfig);

      return NextResponse.json({ url: session.url });
    } else if (body.customOrder) {
      // Custom Order / Vessel Checkout Flow
      const { lineItems, customerInfo, paymentOption, totalAmount, cartItems } = body;

      const sessionConfig: any = {
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://limenlakay.com'}/payment-success?session_id={CHECKOUT_SESSION_ID}&custom_order=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://limenlakay.com'}/custom-order`,
        customer_email: customerInfo.email,
        metadata: {
          type: 'custom_order',
          customerName: customerInfo.name,
          customerPhone: customerInfo.phone || '',
          shippingAddress: `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} ${customerInfo.zip}`,
          paymentOption: paymentOption || 'card',
          cartItems: JSON.stringify(cartItems),
        },
        shipping_address_collection: {
          allowed_countries: ['US'],
        },
      };

      // Enable Affirm for orders over $110 (Affirm's minimum)
      if (paymentOption === 'affirm' && totalAmount >= 110) {
        sessionConfig.payment_method_types = ['card', 'affirm'];
      } else {
        sessionConfig.payment_method_types = ['card'];
      }

      const session = await stripe.checkout.sessions.create(sessionConfig);

      return NextResponse.json({ url: session.url });
    } else {
      // Workshop Checkout Flow (existing code)
      const { name, email, phone, workshopDate, packageType, packagePrice, paymentOption } = body;

      // Fetch session details from database
      const supabase = await createClient();
      const { data: sessionData, error: sessionError } = await supabase
        .from('workshop_sessions')
        .select('*')
        .eq('id', workshopDate)
        .single();

      if (sessionError || !sessionData) {
        console.error('Session fetch error:', sessionError);
        return NextResponse.json(
          { error: 'Invalid workshop session selected' },
          { status: 400 }
        );
      }

      // Format the session date and time for display
      const sessionDate = new Date(sessionData.session_date);
      const formattedDate = sessionDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const sessionDescription = `${formattedDate} at ${sessionData.session_time}`;

      // Configure session based on payment option
      const sessionConfig: any = {
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: packageType === 'single' ? 'Single Workshop Session' : 'Monthly Workshop Subscription',
                description: `Workshop: ${sessionDescription}`,
                images: ['https://www.limenlakay.com/images/workshop-cement-vessel.jpeg'],
              },
              unit_amount: packagePrice * 100, // Stripe uses cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `https://www.limenlakay.com/workshop-subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `https://www.limenlakay.com/workshop-subscription?canceled=true`,
        customer_email: email,
        metadata: {
          type: 'workshop',
          name,
          phone,
          workshopDate: workshopDate,
          workshopSessionId: workshopDate,
          sessionDescription,
          packageType,
          paymentOption,
        },
      };

      // Affirm requires shipping address collection
      if (paymentOption === 'affirm') {
        sessionConfig.payment_method_types = ['card', 'affirm'];
        sessionConfig.shipping_address_collection = {
          allowed_countries: ['US', 'CA'],
        };
        sessionConfig.phone_number_collection = {
          enabled: true,
        };
      } else {
        sessionConfig.payment_method_types = ['card'];
      }

      const session = await stripe.checkout.sessions.create(sessionConfig);

      return NextResponse.json({ sessionId: session.id, url: session.url });
    }
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
