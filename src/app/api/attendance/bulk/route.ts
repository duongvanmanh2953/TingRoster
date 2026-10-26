import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { AttendanceStatus } from '@prisma/client';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const BulkAttendanceSchema = z.object({
  groupId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  records: z.array(
    z.object({
      memberId: z.string().min(1),
      isPresent: z.boolean(),
      status: z.nativeEnum(AttendanceStatus).default(AttendanceStatus.PRESENT),
    })
  ),
});

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = BulkAttendanceSchema.parse(body);

    const group = await prisma.group.findFirst({
      where: { id: parsed.groupId, userId },
    });

    if (!group) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy nhóm' }, { status: 404 });
    }

    const date = new Date(parsed.date);

    // Atomic transaction for bulk upsert
    await prisma.$transaction(
      parsed.records.map((r) =>
        prisma.attendance.upsert({
          where: {
            groupId_memberId_date: {
              groupId: parsed.groupId,
              memberId: r.memberId,
              date,
            },
          },
          update: {
            isPresent: r.isPresent,
            status: r.status,
          },
          create: {
            groupId: parsed.groupId,
            memberId: r.memberId,
            date,
            isPresent: r.isPresent,
            status: r.status,
          },
        })
      )
    );

    return NextResponse.json({ success: true, count: parsed.records.length });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0]?.message }, { status: 400 });
    }
    console.error('Bulk attendance error:', err);
    return NextResponse.json({ success: false, error: 'Lỗi lưu điểm danh hàng loạt' }, { status: 500 });
  }
}
