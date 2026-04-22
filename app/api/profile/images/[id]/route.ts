import { NextRequest, NextResponse } from 'next/server';
import { Op } from 'sequelize';
import { connectDB } from '@/lib/db';
import { ProfileImageModel, UserModel } from '@/models';
import { authenticateRequest } from '@/utils/auth';

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const payload = authenticateRequest(request);

    const { pathname } = new URL(request.url);
    const imageId = pathname.split('/').pop();

    if (!imageId) {
      return NextResponse.json({ success: false, error: 'Image ID is required' }, { status: 400 });
    }

    // Check if image belongs to the user
    const image = await ProfileImageModel.findByPk(imageId);
    if (!image || image.user_id !== payload.userId) {
      return NextResponse.json({ success: false, error: 'Image not found or unauthorized' }, { status: 403 });
    }

    // If deleting primary image, set another as primary
    if (image.is_primary) {
      const nextImage = await ProfileImageModel.findOne({
        where: {
          user_id: payload.userId,
          id: { [Op.ne]: imageId },
        },
        order: [['created_at', 'ASC']],
      });

      if (nextImage) {
        await nextImage.update({ is_primary: true });
        await UserModel.update(
          { profile_image: nextImage.image_url },
          { where: { id: payload.userId } }
        );
      } else {
        // No more images, clear profile_image
        await UserModel.update(
          { profile_image: undefined } as any,
          { where: { id: payload.userId } }
        );
      }
    }

    // Delete the image
    await ProfileImageModel.destroy({
      where: { id: imageId },
    });

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Delete image error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const payload = authenticateRequest(request);

    const { pathname } = new URL(request.url);
    const imageId = pathname.split('/').pop();

    if (!imageId) {
      return NextResponse.json({ success: false, error: 'Image ID is required' }, { status: 400 });
    }

    // Check if image belongs to the user
    const image = await ProfileImageModel.findByPk(imageId);
    if (!image || image.user_id !== payload.userId) {
      return NextResponse.json({ success: false, error: 'Image not found or unauthorized' }, { status: 403 });
    }

    // Already primary
    if (image.is_primary) {
      return NextResponse.json({
        success: true,
        message: 'Image is already primary',
        data: image,
      });
    }

    // Remove primary from all other images
    await ProfileImageModel.update(
      { is_primary: false },
      { where: { user_id: payload.userId } }
    );

    // Set this image as primary
    await image.update({ is_primary: true });

    // Update user's profile_image field
    await UserModel.update(
      { profile_image: image.image_url },
      { where: { id: payload.userId } }
    );

    return NextResponse.json({
      success: true,
      message: 'Image set as primary',
      data: image,
    });
  } catch (error) {
    console.error('Update image error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update image' },
      { status: 500 }
    );
  }
}