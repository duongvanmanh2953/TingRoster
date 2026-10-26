import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const CreateMemberSchema = z.object({
  groupId: z.string().min(1, 'Thiếu groupId'),
  name: z.string().min(2, 'Tên học viên tối thiểu 2 ký tự'),
  phone: z.string().optional(),
  parentName: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  const groupId = req.nextUrl.searchParams.get('groupId');
  if (!groupId) {
    return NextResponse.json({ success: false, error: 'Thiếu groupId' }, { status: 400 });
  }

  // Ensure user owns this group
  const group = await prisma.group.findFirst({
    where: { id: groupId, userId },
  });

  if (!group) {
    return NextResponse.json({ success: false, error: 'Không tìm thấy nhóm' }, { status: 404 });
  }

  const members = await prisma.member.findMany({
    where: { groupId, status: 'ACTIVE' },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ success: true, data: members });
}

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = CreateMemberSchema.parse(body);

    const group = await prisma.group.findFirst({
      where: { id: parsed.groupId, userId },
    });

    if (!group) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy nhóm' }, { status: 404 });
    }

    const member = await prisma.member.create({
      data: {
        groupId: parsed.groupId,
        name: parsed.name.trim(),
        phone: parsed.phone?.trim() || null,
        parentName: parsed.parentName?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0]?.message }, { status: 400 });
    }
    console.error('Create member error:', err);
    return NextResponse.json({ success: false, error: 'Lỗi tạo học viên' }, { status: 500 });
  }
}
