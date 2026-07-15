// app/api/subcastes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { SubCaste } from '@/models';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const caste_id = searchParams.get('caste_id');

    const where = caste_id ? { caste_id: parseInt(caste_id) } : {};
    const subcastes = await SubCaste.findAll({ where, order: [['name', 'ASC']] });

    return NextResponse.json({ success: true, data: subcastes });
  } catch (error) {
    console.error('Get subcastes error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch subcastes' }, { status: 500 });
  }
}
