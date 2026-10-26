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

  const transactions = await prisma.transactionLog.findMany({
    where: {
      processingStatus: ProcessingStatus.UNMATCHED,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, data: transactions });
}
