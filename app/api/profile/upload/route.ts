// app/api/profile/upload/route.ts — Profile image upload
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { UserModel, ProfileImageModel, syncModels } from '@/models';
import { authenticateRequest } from '@/utils/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const payload = authenticateRequest(request);

    const images = await ProfileImageModel.findAll({
      where: { user_id: payload.userId },
      attributes: ['id', 'image_url', 'is_primary'],
      order: [['is_primary', 'DESC'], ['created_at', 'DESC']],
    });

    return NextResponse.json({
      success: true,
      data: images,
    });
  } catch (error) {
    console.error('Fetch images error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch images' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    await syncModels();
    
    // Handle authentication separately
    let payload;
    try {
      payload = authenticateRequest(request);
    } catch (authError) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please login first.' },
        { status: 401 }
      );
    }

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

    const buffer = Buffer.from(await file.arrayBuffer());
    const imageUrl = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Check if this is the first image
    const count = await ProfileImageModel.count({
      where: { user_id: payload.userId },
    });

    // Create profile image record
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
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
