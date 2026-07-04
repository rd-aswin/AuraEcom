import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendShippingEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Missing orderId or status' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Verify Requesting User has Admin Privileges
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || !profile.is_admin) {
      return NextResponse.json({ error: 'Forbidden: Admin access only' }, { status: 403 });
    }

    // 2. Perform database update in Supabase
    const { data: orderData, error: updateError } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // 3. Trigger Brevo Shipping Email on transition to 'shipped' or 'delivered'
    if (orderData && ['shipped', 'delivered'].includes(status)) {
      const address = orderData.shipping_address as any;
      const customerEmail = address?.email;
      const customerName = address?.fullName;

      if (customerEmail && customerName) {
        await sendShippingEmail(customerEmail, customerName, orderId, status as 'shipped' | 'delivered');
      }
    }

    return NextResponse.json({
      success: true,
      message: `Order status successfully updated to: ${status}`
    });

  } catch (err: any) {
    console.error('Admin order status API error:', err);
    return NextResponse.json({ error: err.message || 'Operation failed' }, { status: 500 });
  }
}
