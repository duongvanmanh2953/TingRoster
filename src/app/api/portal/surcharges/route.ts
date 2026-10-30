import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db/prisma';
import { SurchargeService } from '@/server/services/surcharge.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });

  try {
    // Find member profiles linked to this user
    const members = await prisma.member.findMany({
      where: { userId },
      select: { id: true },
    });
    const memberIds = members.map((m) => m.id);

    const surcharges = await prisma.surchargeProposal.findMany({
      where: {
        memberId: { in: memberIds },
      },
      include: {
        group: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: surcharges });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Lỗi tải phụ thu thành viên' }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });

  try {
    const body = await req.json();
    const { surchargeId, action, responseNote } = body;

    if (!surchargeId || !['ACCEPT', 'REJECT', 'DISPUTE'].includes(action)) {
      return NextResponse.json({ success: false, error: 'Dữ liệu phản hồi không hợp lệ' }, { status: 400 });
    }

    const updated = await SurchargeService.memberRespond(surchargeId, userId, action, responseNote);
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Lỗi phản hồi phụ thu' }, { status: 400 });
  }
}
