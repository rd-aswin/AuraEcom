import { NextResponse } from 'next/server';
import { getPaymentGateway } from '@/lib/payments/factory';
import { createClient } from '@/lib/supabase/server';
import { sendOrderEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      paymentId, 
      orderId, 
      signature, 
      internalOrderId, 
      mockItems, 
      mockCustomer 
    } = body;

    if (!paymentId || !orderId || !signature || !internalOrderId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // 1. Verify the signature using the active payment adapter
    const paymentGateway = getPaymentGateway();
    const isValid = paymentGateway.verifyPayment({
      paymentId,
      orderId,
      signature
    });

    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Signature verification failed' }, { status: 400 });
    }

    // 2. Update order status to 'paid' in Supabase and fetch items
    const supabase = await createClient();
    
    const { data: orderData, error } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        payment_transaction_id: paymentId,
        updated_at: new Date().toISOString()
      })
      .eq('id', internalOrderId)
      .select(`
        id,
        total_amount,
        shipping_address,
        order_items (
          quantity,
          price_at_purchase,
          products (
            title
          )
        )
      `)
      .single();

    if (error) {
      throw error;
    }
    
    // 3. Dispatch the Brevo Order Confirmation email using DB records
    if (orderData) {
      const address = orderData.shipping_address as any;
      const customerEmail = address?.email;
      const customerName = address?.fullName;
      
      if (!customerEmail || !customerName) {
        throw new Error('Customer contact details missing from shipping records');
      }

      // Map order items from database
      const emailItems = (orderData.order_items || []).map((item: any) => ({
        title: item.products?.title || 'Botanical Product',
        quantity: item.quantity,
        price: Number(item.price_at_purchase)
      }));

      await sendOrderEmail(
        customerEmail,
        customerName,
        orderData.id,
        Number(orderData.total_amount),
        emailItems
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully.'
    });

  } catch (err: any) {
    console.error('Verification API error:', err);
    return NextResponse.json({ error: err.message || 'Verification failed' }, { status: 500 });
  }
}
