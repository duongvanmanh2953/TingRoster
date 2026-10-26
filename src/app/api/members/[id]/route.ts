import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const UpdateMemberSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional().nullable(),
  parentName: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

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
    const parsed = UpdateMemberSchema.parse(body);

    const member = await prisma.member.findFirst({
      where: { id: params.id, group: { userId } },
    });

    if (!member) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy học viên' }, { status: 404 });
    }

    const updated = await prisma.member.update({
      where: { id: params.id },
      data: parsed,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Lỗi cập nhật học viên' }, { status: 500 });
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

  const member = await prisma.member.findFirst({
    where: { id: params.id, group: { userId } },
  });

  if (!member) {
    return NextResponse.json({ success: false, error: 'Không tìm thấy học viên' }, { status: 404 });
  }

  // Soft delete / inactivate
  await prisma.member.update({
    where: { id: params.id },
    data: { status: 'INACTIVE' },
  });

  return NextResponse.json({ success: true, message: 'Đã lưu trữ học viên' });
}
