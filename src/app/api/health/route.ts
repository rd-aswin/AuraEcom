import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Query a single record id from the products table to verify database connection activity.
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Health check API database connection failed:', err);
    return NextResponse.json(
      { status: 'unhealthy', database: 'disconnected', error: err.message },
      { status: 500 }
    );
  }
}
