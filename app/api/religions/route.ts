// app/api/religions/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Religion } from '@/models';

export async function GET() {
  try {
    await connectDB();
    const religions = await Religion.findAll({ order: [['name', 'ASC']] });
    return NextResponse.json({ success: true, data: religions });
  } catch (error) {
    console.error('Get religions error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch religions' }, { status: 500 });
  }
}
