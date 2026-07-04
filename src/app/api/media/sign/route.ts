import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    // 2. Authorize admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || !profile.is_admin) {
      return NextResponse.json({ error: 'Forbidden: Admin privileges required' }, { status: 403 });
    }

    const body = await request.json();
    const { paramsToSign } = body;

    if (!paramsToSign) {
      return NextResponse.json({ error: 'Missing parameters to sign' }, { status: 400 });
    }

    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!apiSecret) {
      return NextResponse.json({ error: 'Cloudinary server API secret not configured' }, { status: 500 });
    }

    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

    return NextResponse.json({
      success: true,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY || '',
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ''
    });

  } catch (err: any) {
    console.error('Cloudinary signing error:', err);
    return NextResponse.json({ error: err.message || 'Signing failed' }, { status: 500 });
  }
}
