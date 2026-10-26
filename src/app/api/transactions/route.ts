import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { ProcessingStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  const status = req.nextUrl.searchParams.get('status') as ProcessingStatus | null;

  const whereClause: Record<string, unknown> = {
    OR: [{ userId }, { userId: null }],
  };

  if (status) {
    whereClause.processingStatus = status;
  }

  const transactions = await prisma.transactionLog.findMany({
    where: whereClause,
    include: {
      matchedInvoice: {
        select: {
          id: true,
          paymentCode: true,
          title: true,
          member: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return NextResponse.json({ success: true, data: transactions });
}
