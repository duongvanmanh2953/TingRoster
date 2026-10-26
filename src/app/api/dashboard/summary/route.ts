import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { InvoiceStatus, ProcessingStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  const groupId = req.nextUrl.searchParams.get('groupId');

  const invoiceWhere: Record<string, unknown> = {
    userId,
    status: { not: InvoiceStatus.VOID },
  };
  if (groupId) invoiceWhere.groupId = groupId;

  // 1. Invoices stats
  const invoices = await prisma.invoice.findMany({
    where: invoiceWhere,
    select: {
      amountDue: true,
      amountPaid: true,
      status: true,
    },
  });

  let totalDue = 0;
  let totalPaid = 0;
  let unpaidCount = 0;
  let partialCount = 0;
  let paidCount = 0;

  for (const inv of invoices) {
    totalDue += inv.amountDue;
    totalPaid += inv.amountPaid;
    if (inv.status === InvoiceStatus.UNPAID) unpaidCount++;
    else if (inv.status === InvoiceStatus.PARTIAL) partialCount++;
    else if (inv.status === InvoiceStatus.PAID || inv.status === InvoiceStatus.OVERPAID) paidCount++;
  }

  const remaining = Math.max(0, totalDue - totalPaid);
  const collectionRate = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;

  // 2. Today's attendance
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendanceWhere: Record<string, unknown> = {
    date: today,
    isPresent: true,
    group: { userId },
  };
  if (groupId) attendanceWhere.groupId = groupId;

  const todayAttendeesCount = await prisma.attendance.count({
    where: attendanceWhere,
  });

  // 3. Unmatched transactions count
  const unmatchedCount = await prisma.transactionLog.count({
    where: {
      processingStatus: ProcessingStatus.UNMATCHED,
    },
  });

  // 4. Recent transactions
  const recentTransactions = await prisma.transactionLog.findMany({
    where: {
      OR: [{ userId }, { userId: null }],
    },
    include: {
      matchedInvoice: {
        select: {
          paymentCode: true,
          member: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return NextResponse.json({
    success: true,
    data: {
      totalDue,
      totalPaid,
      remaining,
      collectionRate,
      unpaidCount,
      partialCount,
      paidCount,
      todayAttendeesCount,
      unmatchedCount,
      recentTransactions,
    },
  });
}
