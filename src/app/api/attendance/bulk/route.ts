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

const SingleRecordSchema = z.object({
  memberId: z.string().min(1, 'memberId không được để trống'),
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
  const dateStr = req.nextUrl.searchParams.get('date');

  if (!groupId) {
    return NextResponse.json({
      success: true,
      message: 'Bulk Attendance API. Vui lòng gửi POST với payload { groupId, date, records: [...] } hoặc { groupId, date, attendances: [...] }',
    });
  }

  const group = await prisma.group.findFirst({
    where: { id: groupId, userId },
  });

  if (!group) {
    return NextResponse.json({ success: false, error: 'Không tìm thấy nhóm hoặc không có quyền truy cập' }, { status: 404 });
  }

  let dateFilter: Date | undefined;
  if (dateStr) {
    const parsedDate = new Date(dateStr);
    if (!isNaN(parsedDate.getTime())) {
      dateFilter = parsedDate;
    }
  }

  const attendances = await prisma.attendance.findMany({
    where: {
      groupId,
      ...(dateFilter ? { date: dateFilter } : {}),
    },
    include: {
      member: {
        select: { id: true, name: true, phone: true },
      },
    },
    orderBy: { date: 'desc' },
    take: 100,
  });

  return NextResponse.json({ success: true, data: attendances, count: attendances.length });
}

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const rawBody = await req.json();

    const groupId = rawBody.groupId;
    if (!groupId || typeof groupId !== 'string') {
      return NextResponse.json({ success: false, error: 'Thiếu groupId hợp lệ' }, { status: 400 });
    }

    const rawDate = rawBody.date;
    if (!rawDate) {
      return NextResponse.json({ success: false, error: 'Thiếu tham số ngày (date)' }, { status: 400 });
    }

    const date = new Date(rawDate);
    if (isNaN(date.getTime())) {
      return NextResponse.json({ success: false, error: 'Định dạng ngày không hợp lệ' }, { status: 400 });
    }

    // Accept records from either rawBody.records or rawBody.attendances or rawBody.items
    const rawList = Array.isArray(rawBody.records)
      ? rawBody.records
      : Array.isArray(rawBody.attendances)
      ? rawBody.attendances
      : Array.isArray(rawBody.items)
      ? rawBody.items
      : null;

    if (!rawList) {
      return NextResponse.json({ success: false, error: 'Danh sách điểm danh rỗng (records/attendances)' }, { status: 400 });
    }

    const group = await prisma.group.findFirst({
      where: { id: groupId, userId },
    });

    if (!group) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy nhóm hoặc bạn không có quyền sở hữu nhóm này' }, { status: 404 });
    }

    if (rawList.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: 'Danh sách rỗng, không có thay đổi' });
    }

    const records = (rawList as unknown[]).map((item: unknown) => {
      const parsed = SingleRecordSchema.parse(item);
      const isPresent = typeof parsed.isPresent === 'boolean' ? parsed.isPresent : true;
      const status = normalizeAttendanceStatus(parsed.status, isPresent);
      return {
        memberId: parsed.memberId,
        isPresent,
        status,
        note: parsed.note || null,
      };
    });

    // Atomic transaction for bulk upsert
    await prisma.$transaction(
      records.map((r: { memberId: string; isPresent: boolean; status: AttendanceStatus; note: string | null }) =>
        prisma.attendance.upsert({
          where: {
            groupId_memberId_date: {
              groupId,
              memberId: r.memberId,
              date,
            },
          },
          update: {
            isPresent: r.isPresent,
            status: r.status,
            note: r.note,
          },
          create: {
            groupId,
            memberId: r.memberId,
            date,
            isPresent: r.isPresent,
            status: r.status,
            note: r.note,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      count: records.length,
      message: `Đã lưu thành công điểm danh cho ${records.length} thành viên`,
    });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0]?.message || 'Dữ liệu không hợp lệ' }, { status: 400 });
    }
    console.error('Bulk attendance error:', err);
    return NextResponse.json({ success: false, error: 'Lỗi máy chủ khi lưu điểm danh hàng loạt' }, { status: 500 });
  }
}
