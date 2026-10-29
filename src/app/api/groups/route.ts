import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

import { generateSpaceCode } from '@/lib/spaces/constants';

const CreateGroupSchema = z.object({
  name: z.string().min(2, 'Tên không gian tối thiểu 2 ký tự'),
  slug: z.string().min(2, 'Slug tối thiểu 2 ký tự').regex(/^[a-z0-9-]+$/, 'Slug chỉ gồm chữ thường, số và dấu gạch ngang'),
  description: z.string().optional(),
  defaultFee: z.number().int().nonnegative().default(0),
  billingCycle: z.enum(['DAILY', 'MONTHLY', 'PER_SESSION']).default('MONTHLY'),
  groupType: z.enum(['CLASS', 'SPORTS_CLUB', 'RENTAL', 'GENERAL']).default('GENERAL'),
  logoUrl: z.string().nullable().optional(),
  themeColor: z.string().regex(/^#([A-Fa-f0-9]{6})$/, 'Mã màu HEX không hợp lệ').default('#2538D9'),
  enabledModules: z.union([z.string(), z.array(z.string())]).optional(),
});

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get('status') || 'active';

  const whereCondition: any = { userId };
  if (statusParam === 'active') {
    whereCondition.isActive = true;
  } else if (statusParam === 'archived') {
    whereCondition.isActive = false;
  }

  const [groups, totalActive, totalArchived] = await Promise.all([
    prisma.group.findMany({
      where: whereCondition,
      include: {
        _count: {
          select: { members: true, invoices: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.group.count({ where: { userId, isActive: true } }),
    prisma.group.count({ where: { userId, isActive: false } }),
  ]);

  return NextResponse.json({
    success: true,
    data: groups,
    meta: {
      totalActive,
      totalArchived,
      totalAll: totalActive + totalArchived,
    },
  });
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
        { success: false, error: 'Mã đường dẫn (slug) này đã được sử dụng. Vui lòng chọn slug khác' },
        { status: 400 }
      );
    }

    // Generate unique space code with safe collision retry
    let spaceCode = generateSpaceCode();
    for (let attempts = 0; attempts < 5; attempts++) {
      const existingCode = await prisma.group.findUnique({
        where: { code: spaceCode },
      });
      if (!existingCode) break;
      spaceCode = generateSpaceCode();
    }

    const enabledModulesStr = Array.isArray(parsed.enabledModules)
      ? parsed.enabledModules.join(',')
      : (parsed.enabledModules || 'members,attendance,invoices,reports,reconciliation');

    const group = await prisma.group.create({
      data: {
        userId,
        name: parsed.name.trim(),
        slug: parsed.slug.trim(),
        code: spaceCode,
        description: parsed.description,
        logoUrl: parsed.logoUrl,
        themeColor: parsed.themeColor || '#2538D9',
        enabledModules: enabledModulesStr,
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
    console.error('Create space error:', err);
    return NextResponse.json({ success: false, error: 'Lỗi tạo không gian mới' }, { status: 500 });
  }
}
