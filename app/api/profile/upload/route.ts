// app/api/profile/upload/route.ts — Profile image upload
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { connectDB } from '@/lib/db';
import { UserModel } from '@/models';
import { authenticateRequest } from '@/utils/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const payload = authenticateRequest(request);

    const formData = await request.formData();
    const file = formData.get('profile_image') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Only JPEG, PNG, and WebP images are allowed' },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File size must be under 5MB' }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase() || '.jpg';
    const filename = `${uuidv4()}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    await mkdir(uploadDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);

    const imageUrl = `/uploads/${filename}`;

    await UserModel.update(
      { profile_image: imageUrl },
      { where: { id: payload.userId } }
    );

    return NextResponse.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: { profile_image: imageUrl },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}
