import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const members = await prisma.member.findMany({
      where: { userId },
      select: { id: true, name: true, groupId: true },
    });
    const memberIds = members.map((m) => m.id);

    if (memberIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          records: [],
          stats: { present: 0, absentCharged: 0, absentExcused: 0, makeup: 0, total: 0 },
          pendingAdjustments: [],
        },
      });
    }

    const groupId = req.nextUrl.searchParams.get('groupId');
    const whereClause: Record<string, unknown> = {
      memberId: { in: memberIds },
    };
    if (groupId) whereClause.groupId = groupId;

    const attendances = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        group: { select: { id: true, name: true, slug: true, groupType: true } },
      },
      orderBy: { date: 'desc' },
      take: 100,
    });

    const adjustments = await prisma.attendanceAdjustmentRequest.findMany({
      where: { memberId: { in: memberIds } },
      include: {
        member: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Compute stats
    let present = 0;
    let absentCharged = 0;
    let absentExcused = 0;
    let makeup = 0;

    attendances.forEach((a) => {
      if (a.status === 'PRESENT') present++;
      else if (a.status === 'ABSENT_CHARGED') absentCharged++;
      else if (a.status === 'ABSENT_EXCUSED') absentExcused++;
      else if (a.status === 'MAKEUP') makeup++;
    });

    return NextResponse.json({
      success: true,
      data: {
        records: attendances,
        stats: {
          present,
          absentCharged,
          absentExcused,
          makeup,
          total: attendances.length,
        },
        pendingAdjustments: adjustments,
      },
    });
  } catch (err: unknown) {
    console.error('Portal attendance API error:', err);
    return NextResponse.json({ success: false, error: 'Không thể tải lịch sử điểm danh' }, { status: 500 });
  }
}
