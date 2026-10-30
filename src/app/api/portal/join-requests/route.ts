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
    const requests = await prisma.spaceJoinRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            slug: true,
            groupType: true,
            logoUrl: true,
            themeColor: true,
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: requests,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi máy chủ';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
