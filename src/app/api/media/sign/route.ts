import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(request: Request) {
  try {
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
