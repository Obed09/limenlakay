import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabase
      .from('custom_orders')
      .select(`
        *,
        custom_order_items (
          *,
          vessel:candle_vessels (*),
          scent:candle_scents (*)
        )
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orders: data });
  } catch (error) {
    console.error('Error in GET /api/custom-orders:', error);
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
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      shipping_city,
      shipping_state,
      shipping_zip,
      items,
      notes
    } = body;

    // Validate required fields
    if (!customer_name || !customer_email || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.unit_price * item.quantity,
      0
    );
    const shipping_cost = 10; // Fixed shipping for now
    const total = subtotal + shipping_cost;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('custom_orders')
      .insert([
        {
          order_number: orderNumber,
          customer_name,
          customer_email,
          customer_phone,
          shipping_address,
          shipping_city,
          shipping_state,
          shipping_zip,
          subtotal,
          shipping_cost,
          total,
          notes,
          status: 'pending',
          payment_status: 'pending'
        }
      ])
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json(
        { error: orderError.message },
        { status: 500 }
      );
    }

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      vessel_id: item.vessel_id,
      scent_id: item.scent_id,
      quantity: item.quantity || 1,
      unit_price: item.unit_price,
      subtotal: item.unit_price * (item.quantity || 1)
    }));

    const { error: itemsError } = await supabase
      .from('custom_order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Rollback: delete the order
      await supabase.from('custom_orders').delete().eq('id', order.id);
      return NextResponse.json(
        { error: itemsError.message },
        { status: 500 }
      );
    }

    // Send order confirmation email to customer
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.limenlakay.com'}/api/orders/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: customer_email,
          type: 'confirmation',
          orderNumber: orderNumber,
          customerName: customer_name,
          total: total,
          shippingAddress: `${shipping_address}, ${shipping_city}, ${shipping_state} ${shipping_zip}`,
          orderDetails: items.map((item: any) => 
            `<div class="item">${item.quantity}x ${item.vessel_name || 'Custom Candle'} - $${item.unit_price}</div>`
          ).join(''),
        }),
      });
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
      // Don't fail the order if email fails
    }

    return NextResponse.json(
      {
        success: true,
        order: {
          id: order.id,
          order_number: orderNumber,
          total
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/custom-orders:', error);
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
    const { order_id, status, payment_status, tracking_number, admin_notes } =
      body;

    if (!order_id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (payment_status) updateData.payment_status = payment_status;
    if (tracking_number) updateData.tracking_number = tracking_number;
    if (admin_notes !== undefined) updateData.admin_notes = admin_notes;

    if (status === 'shipped') {
      updateData.shipped_at = new Date().toISOString();
    }
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('custom_orders')
      .update(updateData)
      .eq('id', order_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating order:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send shipping notification email if status changed to 'shipped' and tracking number exists
    if (status === 'shipped' && data.tracking_number && data.customer_email) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.limenlakay.com'}/api/orders/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: data.customer_email,
            type: 'shipped',
            orderNumber: data.order_number,
            customerName: data.customer_name,
            trackingNumber: data.tracking_number,
            shippingAddress: `${data.shipping_address}, ${data.shipping_city}, ${data.shipping_state} ${data.shipping_zip}`,
          }),
        });
      } catch (emailError) {
        console.error('Failed to send shipping notification email:', emailError);
        // Don't fail the update if email fails
      }
    }

    return NextResponse.json({ success: true, order: data });
  } catch (error) {
    console.error('Error in PATCH /api/custom-orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
