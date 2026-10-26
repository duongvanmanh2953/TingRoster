import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const UpdateGroupSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  defaultFee: z.number().int().nonnegative().optional(),
  billingCycle: z.enum(['DAILY', 'MONTHLY', 'PER_SESSION']).optional(),
  groupType: z.enum(['CLASS', 'SPORTS_CLUB', 'RENTAL']).optional(),
  isActive: z.boolean().optional(),
  publicPortalEnabled: z.boolean().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  const group = await prisma.group.findFirst({
    where: { id: params.id, userId },
    include: {
      members: { orderBy: { name: 'asc' } },
      _count: { select: { members: true, invoices: true } },
    },
  });

  if (!group) {
    return NextResponse.json({ success: false, error: 'Không tìm thấy nhóm' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: group });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = UpdateGroupSchema.parse(body);

    const group = await prisma.group.findFirst({
      where: { id: params.id, userId },
    });

    if (!group) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy nhóm' }, { status: 404 });
    }

    const updated = await prisma.group.update({
      where: { id: params.id },
      data: parsed,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Lỗi cập nhật nhóm' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  // Soft delete / archive group
  const group = await prisma.group.findFirst({
    where: { id: params.id, userId },
  });

  if (!group) {
    return NextResponse.json({ success: false, error: 'Không tìm thấy nhóm' }, { status: 404 });
  }

  await prisma.group.update({
    where: { id: params.id },
    data: { isActive: false },
  });

  return NextResponse.json({ success: true, message: 'Đã lưu trữ nhóm' });
}
