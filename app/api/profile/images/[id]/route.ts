import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { connectDB } from '@/lib/db';
import { ProfileImageModel, UserModel } from '@/models';
import { authenticateRequest } from '@/utils/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const payload = authenticateRequest(request);

    const formData = await request.formData();
    const file = formData.get('profile_image') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${uuid()}-${file.name}`;
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, buffer);

    const imageUrl = `/uploads/${filename}`;

    // 🔥 IMPORTANT LOGIC
    const count = await ProfileImageModel.count({
      where: { user_id: payload.userId },
    });

    const newImage = await ProfileImageModel.create({
      user_id: payload.userId,
      image_url: imageUrl,
      is_primary: count === 0,
    });

    // Set user profile image only if first image
    if (count === 0) {
      await UserModel.update(
        { profile_image: imageUrl },
        { where: { id: payload.userId } }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: newImage,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    );
  }
}