import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, workshopDate, packageType, packagePrice } = await request.json();

    // Initialize Stripe only when needed
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    // Fetch session details from database (workshopDate is actually the session ID now)
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

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
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
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/workshop-subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/workshop-subscription?canceled=true`,
      customer_email: email,
      metadata: {
        name,
        phone,
        workshopDate: workshopDate, // This is the session ID
        workshopSessionId: workshopDate, // Explicitly store as session ID
        sessionDescription,
        packageType,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
