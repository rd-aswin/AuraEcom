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

    if (!customerInfo || !customerInfo.fullName || !customerInfo.email || !customerInfo.street) {
      return NextResponse.json({ error: 'Invalid or incomplete shipping details' }, { status: 400 });
    }

    // 1. Enforce Authentication & Initialize Supabase
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser().catch(() => ({ data: { user: null }, error: null }));
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }
    const userId = user.id;

    // 2. Validate input quantities
    for (const item of items) {
      if (!item.quantity || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
        return NextResponse.json({ error: 'Invalid product quantity' }, { status: 400 });
      }
    }

    // 3. Fetch product details from DB and verify pricing & inventory
    const productIds = items.map((item: any) => item.product.id);
    const { data: dbProducts, error: dbFetchError } = await supabase
      .from('products')
      .select('id, title, price, stock_quantity')
      .in('id', productIds);

    if (dbFetchError || !dbProducts) {
      throw new Error('Failed to fetch catalog product details');
    }

    const verifiedItems = items.map((item: any) => {
      const dbProduct = dbProducts.find((p: any) => p.id === item.product.id);
      if (!dbProduct) {
        throw new Error(`Product reference not found: ${item.product.title || item.product.id}`);
      }

      if (dbProduct.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for product: ${dbProduct.title}`);
      }

      return {
        product_id: dbProduct.id,
        quantity: item.quantity,
        price_at_purchase: dbProduct.price
      };
    });

    // Calculate total amount from server-side database pricing
    const totalAmount = verifiedItems.reduce((sum: number, item: any) => {
      return sum + item.price_at_purchase * item.quantity;
    }, 0);

    // 4. Try to create the order record in Supabase
    let internalOrderId = 'order_' + Math.random().toString(36).substring(2, 11);
    
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
      const orderItems = verifiedItems.map((item: any) => ({
        order_id: internalOrderId,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: item.price_at_purchase
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;
    }

    // 5. Call the payment gateway factory
    const paymentGateway = getPaymentGateway();
    
    // Create payment order on the active gateway (e.g. Razorpay)
    const paymentOrder = await paymentGateway.createOrder({
      amount: totalAmount,
      currency: 'INR',
      receiptId: internalOrderId,
    });

    // 6. Update the order with the gateway order ID in Supabase
    await supabase
      .from('orders')
      .update({ payment_order_id: paymentOrder.id })
      .eq('id', internalOrderId);

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
