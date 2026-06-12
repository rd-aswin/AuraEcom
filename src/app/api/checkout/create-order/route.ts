import { NextResponse } from 'next/server';
import { getPaymentGateway } from '@/lib/payments/factory';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, customerInfo } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Calculate total amount (in INR/USD)
    const totalAmount = items.reduce((sum: number, item: any) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    // 1. Try to create the order record in Supabase
    let internalOrderId = 'order_' + Math.random().toString(36).substring(2, 11);
    
    try {
      const supabase = await createClient();
      
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
      const userId = user ? user.id : null;

      // We insert a pending order record
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          total_amount: totalAmount,
          status: 'pending',
          shipping_address: customerInfo,
          payment_gateway: process.env.PAYMENT_PROVIDER || 'razorpay'
        })
        .select()
        .single();

      if (orderError) throw orderError;
      
      if (orderData) {
        internalOrderId = orderData.id;
        
        // Insert individual order items
        const orderItems = items.map((item: any) => ({
          order_id: internalOrderId,
          product_id: item.product.id,
          quantity: item.quantity,
          price_at_purchase: item.product.price
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;
      }
    } catch (dbErr) {
      console.warn('Database logging skipped (Supabase client not configured or tables missing):', dbErr);
    }

    // 2. Call the payment gateway factory
    const paymentGateway = getPaymentGateway();
    
    // Create payment order on the active gateway (e.g. Razorpay)
    const paymentOrder = await paymentGateway.createOrder({
      amount: totalAmount,
      currency: 'INR', // Indian Rupee default (adjust as needed in environment configuration)
      receiptId: internalOrderId,
    });

    // 3. Update the order with the gateway order ID in Supabase
    try {
      const supabase = await createClient();
      await supabase
        .from('orders')
        .update({ payment_order_id: paymentOrder.id })
        .eq('id', internalOrderId);
    } catch {
      // Ignored in local dev environment
    }

    return NextResponse.json({
      success: true,
      order: paymentOrder,
      internalOrderId: internalOrderId,
      keyId: process.env.RAZORPAY_KEY_ID || ''
    });

  } catch (err: any) {
    console.error('Checkout API error:', err);
    return NextResponse.json({ error: err.message || 'Checkout failed' }, { status: 500 });
  }
}
