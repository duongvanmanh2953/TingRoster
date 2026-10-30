import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { AttendanceStatus } from '@prisma/client';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

function normalizeAttendanceStatus(rawStatus?: string, isPresent?: boolean): AttendanceStatus {
  if (!rawStatus) {
    return isPresent === false ? AttendanceStatus.ABSENT_CHARGED : AttendanceStatus.PRESENT;
  }
  const clean = rawStatus.toUpperCase().trim();
  if (clean === 'PRESENT' || clean === 'CO_MAT' || clean === 'LATE' || clean === 'DI_TRE') {
    return AttendanceStatus.PRESENT;
  }
  if (clean === 'ABSENT' || clean === 'ABSENT_CHARGED' || clean === 'VANG' || clean === 'VANG_CO_PHEP_CO_PHI') {
    return AttendanceStatus.ABSENT_CHARGED;
  }
  if (clean === 'EXCUSED' || clean === 'ABSENT_EXCUSED' || clean === 'NGHI_PHEP' || clean === 'VANG_CO_PHEP') {
    return AttendanceStatus.ABSENT_EXCUSED;
  }
  if (clean === 'MAKEUP' || clean === 'HOC_BU') {
    return AttendanceStatus.MAKEUP;
  }
  return isPresent === false ? AttendanceStatus.ABSENT_CHARGED : AttendanceStatus.PRESENT;
}

const UpsertAttendanceSchema = z.object({
  groupId: z.string().min(1),
  memberId: z.string().min(1),
  date: z.string(),
  isPresent: z.boolean().optional(),
  status: z.string().optional(),
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
    if (isNaN(date.getTime())) {
      return NextResponse.json({ success: false, error: 'Định dạng ngày không hợp lệ' }, { status: 400 });
    }

    const isPresent = typeof parsed.isPresent === 'boolean' ? parsed.isPresent : true;
    const status = normalizeAttendanceStatus(parsed.status, isPresent);

    const attendance = await prisma.attendance.upsert({
      where: {
        groupId_memberId_date: {
          groupId: parsed.groupId,
          memberId: parsed.memberId,
          date,
        },
      },
      update: {
        isPresent,
        status,
        note: parsed.note,
      },
      create: {
        groupId: parsed.groupId,
        memberId: parsed.memberId,
        date,
        isPresent,
        status,
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
