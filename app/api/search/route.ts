// app/api/search/route.ts — Search profiles with filters and pagination
import { NextRequest, NextResponse } from 'next/server';
import { Op, WhereOptions } from 'sequelize';
import { connectDB } from '@/lib/db';
import { UserModel, Religion, Caste, SubCaste, SubscriptionModel } from '@/models';
import { authenticateRequest } from '@/utils/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const payload = authenticateRequest(request);
    const { searchParams } = new URL(request.url);

    const age_min = searchParams.get('age_min');
    const age_max = searchParams.get('age_max');
    const gender = searchParams.get('gender');
    const religion_id = searchParams.get('religion_id');
    const caste_id = searchParams.get('caste_id');
    const subcaste_id = searchParams.get('subcaste_id');
    const location = searchParams.get('location');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    const where: WhereOptions = {
      id: { [Op.ne]: payload.userId },
      is_active: true,
    };

    if (age_min || age_max) {
      const ageCondition: Record<symbol, number> = {};
      if (age_min) ageCondition[Op.gte] = parseInt(age_min);
      if (age_max) ageCondition[Op.lte] = parseInt(age_max);
      (where as Record<string, unknown>).age = ageCondition;
    }

    if (gender) (where as Record<string, unknown>).gender = gender;
    if (religion_id) (where as Record<string, unknown>).religion_id = parseInt(religion_id);
    if (caste_id) (where as Record<string, unknown>).caste_id = parseInt(caste_id);
    if (subcaste_id) (where as Record<string, unknown>).subcaste_id = parseInt(subcaste_id);
    if (location) {
      (where as Record<string, unknown>).location = { [Op.like]: `%${location}%` };
    }

    const { count, rows } = await UserModel.findAndCountAll({
      where,
      include: [
        { model: Religion, as: 'religion', attributes: ['id', 'name'] },
        { model: Caste, as: 'caste', attributes: ['id', 'name'] },
        { model: SubCaste, as: 'subcaste', attributes: ['id', 'name'] },
        { model: SubscriptionModel, as: 'subscription', attributes: ['plan_type'] },
      ],
      attributes: { exclude: ['password'] },
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    // Hide phone numbers in search results
    const safeRows = rows.map((user) => {
      const data = user.toJSON() as unknown as Record<string, unknown>;
      delete data.phone;
      return data;
    });

    return NextResponse.json({
      success: true,
      data: safeRows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ success: false, error: 'Search failed' }, { status: 500 });
  }
}
