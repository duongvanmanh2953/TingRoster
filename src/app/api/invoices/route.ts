import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { InvoiceStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  const groupId = req.nextUrl.searchParams.get('groupId');
  const status = req.nextUrl.searchParams.get('status') as InvoiceStatus | null;
  const search = req.nextUrl.searchParams.get('search');

  const whereClause: Record<string, unknown> = { userId };
  if (groupId) whereClause.groupId = groupId;
  if (status) whereClause.status = status;
  if (search) {
    whereClause.OR = [
      { paymentCode: { contains: search, mode: 'insensitive' } },
      { title: { contains: search, mode: 'insensitive' } },
      { member: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const invoices = await prisma.invoice.findMany({
    where: whereClause,
    include: {
      member: { select: { id: true, name: true, phone: true } },
      group: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return NextResponse.json({ success: true, data: invoices });
}
