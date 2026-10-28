import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { z } from 'zod';

const AdjustmentSchema = z.object({
  groupId: z.string().min(1, 'Vui lòng chọn nhóm'),
  date: z.string().min(1, 'Vui lòng chọn ngày điểm danh'),
  requestedStatus: z.enum(['PRESENT', 'ABSENT_CHARGED', 'ABSENT_EXCUSED', 'MAKEUP']),
  reason: z.string().min(5, 'Vui lòng nhập lý do điều chỉnh chi tiết (tối thiểu 5 ký tự)'),
});

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = AdjustmentSchema.parse(body);

    // Verify member belongs to this group
    const member = await prisma.member.findFirst({
      where: { userId, groupId: parsed.groupId },
    });
    if (!member) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy hồ sơ thành viên trong nhóm này' }, { status: 404 });
    }

    const sessionDate = new Date(parsed.date);
    sessionDate.setHours(0, 0, 0, 0);

    // Find if an attendance record already exists for this date
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        groupId_memberId_date: {
          groupId: parsed.groupId,
          memberId: member.id,
          date: sessionDate,
        },
      },
    });

    const adjustment = await prisma.attendanceAdjustmentRequest.create({
      data: {
        memberId: member.id,
        attendanceId: existingAttendance?.id || null,
        groupId: parsed.groupId,
        date: sessionDate,
        requestedStatus: parsed.requestedStatus,
        reason: parsed.reason,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      data: adjustment,
      message: 'Yêu cầu khiếu nại điểm danh đã được gửi đến giáo viên/chủ cơ sở.',
    });
  } catch (err: unknown) {
    console.error('Attendance adjustment error:', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Không thể gửi yêu cầu điều chỉnh' }, { status: 500 });
  }
}
