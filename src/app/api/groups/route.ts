import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const CreateGroupSchema = z.object({
  name: z.string().min(2, 'Tên nhóm tối thiểu 2 ký tự'),
  slug: z.string().min(2, 'Slug tối thiểu 2 ký tự').regex(/^[a-z0-9-]+$/, 'Slug chỉ gồm chữ thường, số và dấu gạch ngang'),
  description: z.string().optional(),
  defaultFee: z.number().int().nonnegative().default(0),
  billingCycle: z.enum(['DAILY', 'MONTHLY', 'PER_SESSION']).default('MONTHLY'),
  groupType: z.enum(['CLASS', 'SPORTS_CLUB', 'RENTAL']).default('CLASS'),
});

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  const groups = await prisma.group.findMany({
    where: { userId, isActive: true },
    include: {
      _count: {
        select: { members: true, invoices: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, data: groups });
}

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = CreateGroupSchema.parse(body);

    // Check slug collision
    const existingSlug = await prisma.group.findUnique({
      where: { slug: parsed.slug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { success: false, error: 'Đường dẫn (slug) này đã được sử dụng. Vui lòng chọn slug khác' },
        { status: 400 }
      );
    }

    const group = await prisma.group.create({
      data: {
        userId,
        name: parsed.name.trim(),
        slug: parsed.slug.trim(),
        description: parsed.description,
        defaultFee: parsed.defaultFee,
        billingCycle: parsed.billingCycle,
        groupType: parsed.groupType,
      },
    });

    return NextResponse.json({ success: true, data: group }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0]?.message }, { status: 400 });
    }
    console.error('Create group error:', err);
    return NextResponse.json({ success: false, error: 'Lỗi tạo nhóm' }, { status: 500 });
  }
}
