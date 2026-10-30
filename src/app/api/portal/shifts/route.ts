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
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId');

    let targetGroupIds: string[] = [];

    if (groupId) {
      targetGroupIds = [groupId];
    } else {
      // Find spaces where user is a member
      const members = await prisma.member.findMany({
        where: { userId },
        select: { groupId: true },
      });
      targetGroupIds = members.map((m) => m.groupId);
    }

    if (targetGroupIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    const shifts = await prisma.workShift.findMany({
      where: {
        groupId: { in: targetGroupIds },
        status: 'OPEN',
      },
      orderBy: [{ shiftDate: 'asc' }, { startTime: 'asc' }],
      include: {
        group: { select: { id: true, name: true, slug: true } },
        assignments: {
          select: {
            id: true,
            userId: true,
            userName: true,
            status: true,
            checkInTime: true,
            checkOutTime: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: shifts,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi máy chủ';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
