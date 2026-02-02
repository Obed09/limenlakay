import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Initialize Stripe only when needed
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
    });
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    const body = await request.text();
    const sig = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const { name, phone, workshopDate, packageType } = session.metadata!;
      const email = session.customer_email;
      const amountPaid = session.amount_total ? session.amount_total / 100 : 0;

      // Save booking to database
      const supabase = await createClient();
      
      const { error } = await supabase
        .from('workshop_bookings')
        .insert([
          {
            name,
            email,
            phone,
            workshop_date: workshopDate,
            package_type: packageType,
            package_price: amountPaid,
            status: 'confirmed',
            payment_status: 'paid',
            stripe_session_id: session.id,
            stripe_payment_intent: session.payment_intent as string,
          }
        ]);

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Failed to save booking' }, { status: 500 });
      }

      // Send confirmation email
      try {
        // Check if this is a workshop booking or product order
        if (packageType) {
          // Workshop booking - use workshop email endpoint
          await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/workshop-booking/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: email,
              name,
              date: workshopDate,
              packageType,
              price: amountPaid,
            }),
          });
        } else {
          // Product order - use order email endpoint
          const { sku, productName } = session.metadata!;
          await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/orders/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: email,
              type: 'confirmation',
              orderNumber: session.id.substring(0, 20),
              customerName: name || 'Valued Customer',
              total: amountPaid,
              orderDetails: `<div class="item">${productName || sku} - $${amountPaid.toFixed(2)}</div>`,
            }),
          });
        }
      } catch (emailError) {
        console.error('Email error:', emailError);
        // Don't fail the webhook if email fails
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
