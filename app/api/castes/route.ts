// app/api/castes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Caste } from '@/models';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const religion_id = searchParams.get('religion_id');

    const where = religion_id ? { religion_id: parseInt(religion_id) } : {};
    const castes = await Caste.findAll({ where, order: [['name', 'ASC']] });

    return NextResponse.json({ success: true, data: castes });
  } catch (error) {
    console.error('Get castes error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch castes' }, { status: 500 });
  }
}
