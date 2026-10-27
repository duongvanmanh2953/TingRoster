import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { AttendanceStatus } from '@prisma/client';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const UpsertAttendanceSchema = z.object({
  groupId: z.string().min(1),
  memberId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Định dạng ngày YYYY-MM-DD'),
  isPresent: z.boolean(),
  status: z.nativeEnum(AttendanceStatus).default(AttendanceStatus.PRESENT),
  note: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  const groupId = req.nextUrl.searchParams.get('groupId');
  const dateStr = req.nextUrl.searchParams.get('date'); // YYYY-MM-DD
  const startDateStr = req.nextUrl.searchParams.get('startDate'); // YYYY-MM-DD
  const endDateStr = req.nextUrl.searchParams.get('endDate'); // YYYY-MM-DD

  if (!groupId || (!dateStr && !startDateStr)) {
    return NextResponse.json({ success: false, error: 'Thiếu groupId hoặc date/startDate' }, { status: 400 });
  }

  const group = await prisma.group.findFirst({
    where: { id: groupId, userId },
  });

  if (!group) {
    return NextResponse.json({ success: false, error: 'Không tìm thấy nhóm' }, { status: 404 });
  }

  let dateFilter: { gte?: Date; lte?: Date } | Date;
  if (startDateStr && endDateStr) {
    dateFilter = {
      gte: new Date(startDateStr),
      lte: new Date(endDateStr),
    };
  } else if (startDateStr) {
    dateFilter = {
      gte: new Date(startDateStr),
    };
  } else {
    dateFilter = new Date(dateStr!);
  }

  const attendances = await prisma.attendance.findMany({
    where: { groupId, date: dateFilter },
    include: { member: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ success: true, data: attendances });
}

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = UpsertAttendanceSchema.parse(body);

    const group = await prisma.group.findFirst({
      where: { id: parsed.groupId, userId },
    });

    if (!group) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy nhóm' }, { status: 404 });
    }

    const date = new Date(parsed.date);

    const attendance = await prisma.attendance.upsert({
      where: {
        groupId_memberId_date: {
          groupId: parsed.groupId,
          memberId: parsed.memberId,
          date,
        },
      },
      update: {
        isPresent: parsed.isPresent,
        status: parsed.status,
        note: parsed.note,
      },
      create: {
        groupId: parsed.groupId,
        memberId: parsed.memberId,
        date,
        isPresent: parsed.isPresent,
        status: parsed.status,
        note: parsed.note,
      },
    });

    return NextResponse.json({ success: true, data: attendance });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0]?.message }, { status: 400 });
    }
    console.error('Attendance error:', err);
    return NextResponse.json({ success: false, error: 'Lỗi lưu điểm danh' }, { status: 500 });
  }
}
