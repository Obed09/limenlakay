import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// Chat message functions
export async function sendChatMessage(sessionId: string, senderType: 'customer' | 'support', message: string, senderName?: string, senderEmail?: string) {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      session_id: sessionId,
      sender_type: senderType,
      sender_name: senderName,
      sender_email: senderEmail,
      message_text: message
    });

  if (error) {
    console.error('Error sending chat message:', error);
    return { success: false, error };
  }
  
  return { success: true, data };
}

export async function getChatMessages(sessionId: string) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching chat messages:', error);
    return { success: false, error };
  }
  
  return { success: true, data };
}

// Feedback functions
export async function submitFeedback(feedback: {
  customer_name?: string;
  customer_email?: string;
  rating: number;
  comment: string;
  order_reference?: string;
}) {
  const { data, error } = await supabase
    .from('customer_feedback')
    .insert(feedback);

  if (error) {
    console.error('Error submitting feedback:', error);
    return { success: false, error };
  }
  
  return { success: true, data };
}

export async function getApprovedFeedback() {
  const { data, error } = await supabase
    .from('customer_feedback')
    .select('*')
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching feedback:', error);
    return { success: false, error };
  }
  
  return { success: true, data };
}

// Order tracking functions
export async function trackOrder(trackingNumber: string) {
  const { data, error } = await supabase
    .from('order_tracking_with_status')
    .select('*')
    .eq('tracking_number', trackingNumber.toUpperCase())
    .single();

  if (error) {
    console.error('Error tracking order:', error);
    return { success: false, error };
  }
  
  return { success: true, data };
}

export async function getOrderStatusHistory(trackingNumber: string) {
  const { data, error } = await supabase
    .from('order_status_history')
    .select('*')
    .eq('tracking_number', trackingNumber.toUpperCase())
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching order history:', error);
    return { success: false, error };
  }
  
  return { success: true, data };
}

// Create a new order tracking entry
export async function createOrderTracking(orderData: {
  tracking_number: string;
  customer_email: string;
  customer_name: string;
  product_details: any;
  estimated_completion?: string;
}) {
  const { data, error } = await supabase
    .from('order_tracking')
    .insert({
      ...orderData,
      tracking_number: orderData.tracking_number.toUpperCase()
    });

  if (error) {
    console.error('Error creating order tracking:', error);
    return { success: false, error };
  }
  
  return { success: true, data };
}

// Update order status
export async function updateOrderStatus(trackingNumber: string, status: string, statusMessage?: string, updatedBy?: string) {
  // Update main order table
  const { error: orderError } = await supabase
    .from('order_tracking')
    .update({ order_status: status })
    .eq('tracking_number', trackingNumber.toUpperCase());

  if (orderError) {
    console.error('Error updating order status:', orderError);
    return { success: false, error: orderError };
  }

  // Add to status history
  const { data, error } = await supabase
    .from('order_status_history')
    .insert({
      tracking_number: trackingNumber.toUpperCase(),
      status,
      status_message: statusMessage,
      updated_by: updatedBy
    });

  if (error) {
    console.error('Error adding status history:', error);
    return { success: false, error };
  }
  
  return { success: true, data };
}