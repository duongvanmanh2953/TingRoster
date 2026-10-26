import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  const { id } = params;

  const member = await prisma.member.findFirst({
    where: { id, group: { userId } },
    include: {
      group: {
        select: {
          id: true,
          name: true,
          slug: true,
          defaultFee: true,
        },
      },
      attendances: {
        orderBy: { date: 'desc' },
        take: 30,
      },
      invoices: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!member) {
    return NextResponse.json({ success: false, error: 'Không tìm thấy học viên' }, { status: 404 });
  }

  // Calculate totals
  let totalDue = 0;
  let totalPaid = 0;
  for (const inv of member.invoices) {
    totalDue += inv.amountDue;
    totalPaid += inv.amountPaid;
  }
  const remainingDebt = Math.max(0, totalDue - totalPaid);

  return NextResponse.json({
    success: true,
    data: {
      ...member,
      totalDue,
      totalPaid,
      remainingDebt,
    },
  });
}
