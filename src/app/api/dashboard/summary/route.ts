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

  const { searchParams } = req.nextUrl;
  const groupId = searchParams.get('groupId');
  const timeframe = (searchParams.get('timeframe') || 'month') as 'day' | 'week' | 'month' | 'quarter';

  const now = new Date();

  // Determine date bounds based on timeframe
  const startDate = new Date();
  if (timeframe === 'day') {
    startDate.setHours(0, 0, 0, 0);
  } else if (timeframe === 'week') {
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // Monday
    startDate.setDate(diff);
    startDate.setHours(0, 0, 0, 0);
  } else if (timeframe === 'quarter') {
    startDate.setMonth(startDate.getMonth() - 3);
    startDate.setHours(0, 0, 0, 0);
  } else {
    // Default 'month'
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
  }

  const invoiceWhere: Record<string, unknown> = {
    userId,
    status: { not: InvoiceStatus.VOID },
  };
  if (groupId) invoiceWhere.groupId = groupId;

  // 1. Fetch Invoices for aggregation
  const invoices = await prisma.invoice.findMany({
    where: invoiceWhere,
    select: {
      id: true,
      amountDue: true,
      amountPaid: true,
      status: true,
      dueDate: true,
      createdAt: true,
    },
  });

  let totalDue = 0;
  let totalPaid = 0;
  let unpaidCount = 0;
  let partialCount = 0;
  let paidCount = 0;
  let overdueCount = 0;
  let overdueAmount = 0;

  for (const inv of invoices) {
    totalDue += inv.amountDue;
    totalPaid += inv.amountPaid;

    const remaining = inv.amountDue - inv.amountPaid;
    const isOverdue = inv.dueDate && new Date(inv.dueDate) < now && remaining > 0;

    if (isOverdue) {
      overdueCount++;
      overdueAmount += remaining;
    }

    if (inv.status === InvoiceStatus.UNPAID) unpaidCount++;
    else if (inv.status === InvoiceStatus.PARTIAL) partialCount++;
    else if (inv.status === InvoiceStatus.PAID || inv.status === InvoiceStatus.OVERPAID) paidCount++;
  }

  const remaining = Math.max(0, totalDue - totalPaid);
  const collectionRate = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;
  const inTermRemaining = Math.max(0, remaining - overdueAmount);

  // Status breakdown percentages
  const totalCount = Math.max(1, invoices.length);
  const breakdown = {
    paid: {
      count: paidCount,
      amount: totalPaid,
      percent: Math.round((paidCount / totalCount) * 100),
    },
    partial: {
      count: partialCount,
      amount: invoices
        .filter((i) => i.status === InvoiceStatus.PARTIAL)
        .reduce((sum, i) => sum + i.amountPaid, 0),
      percent: Math.round((partialCount / totalCount) * 100),
    },
    unpaid: {
      count: unpaidCount,
      amount: inTermRemaining,
      percent: Math.round((unpaidCount / totalCount) * 100),
    },
    overdue: {
      count: overdueCount,
      amount: overdueAmount,
      percent: Math.round((overdueCount / totalCount) * 100),
    },
  };

  // 2. Fetch Transactions for the selected timeframe to build dynamic Trend Chart
  const transactions = await prisma.transactionLog.findMany({
    where: {
      OR: [{ userId }, { userId: null }],
      createdAt: { gte: startDate },
      processingStatus: { in: [ProcessingStatus.MATCHED, ProcessingStatus.PROCESSED] },
    },
    select: {
      amount: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  // Construct trend buckets
  const trend: Array<{ label: string; amount: number; count: number }> = [];

  if (timeframe === 'day') {
    const buckets = [
      { label: '00:00', startH: 0, endH: 6 },
      { label: '06:00', startH: 6, endH: 12 },
      { label: '12:00', startH: 12, endH: 18 },
      { label: '18:00', startH: 18, endH: 24 },
    ];
    for (const b of buckets) {
      const inBucket = transactions.filter((tx) => {
        const h = new Date(tx.createdAt).getHours();
        return h >= b.startH && h < b.endH;
      });
      const amount = inBucket.reduce((sum, tx) => sum + tx.amount, 0);
      trend.push({ label: b.label, amount, count: inBucket.length });
    }
  } else if (timeframe === 'week') {
    const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dayStr = d.toISOString().slice(0, 10);
      const inBucket = transactions.filter(
        (tx) => tx.createdAt.toISOString().slice(0, 10) === dayStr
      );
      const amount = inBucket.reduce((sum, tx) => sum + tx.amount, 0);
      trend.push({ label: dayNames[i], amount, count: inBucket.length });
    }
  } else if (timeframe === 'quarter') {
    for (let i = 2; i >= 0; i--) {
      const mDate = new Date();
      mDate.setMonth(mDate.getMonth() - i);
      const mKey = `${mDate.getFullYear()}-${String(mDate.getMonth() + 1).padStart(2, '0')}`;
      const inBucket = transactions.filter((tx) =>
        tx.createdAt.toISOString().startsWith(mKey)
      );
      const amount = inBucket.reduce((sum, tx) => sum + tx.amount, 0);
      trend.push({ label: `Thg ${mDate.getMonth() + 1}`, amount, count: inBucket.length });
    }
  } else {
    // Default 'month': 4 weeks
    const weekLabels = ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'];
    for (let w = 0; w < 4; w++) {
      const wStart = new Date(startDate);
      wStart.setDate(1 + w * 7);
      const wEnd = new Date(startDate);
      wEnd.setDate(1 + (w + 1) * 7);
      const inBucket = transactions.filter((tx) => {
        const t = new Date(tx.createdAt);
        return t >= wStart && (w === 3 ? true : t < wEnd);
      });
      const amount = inBucket.reduce((sum, tx) => sum + tx.amount, 0);
      trend.push({ label: weekLabels[w], amount, count: inBucket.length });
    }
  }

  // 3. Today's attendance
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

  // 4. Unmatched count
  const unmatchedCount = await prisma.transactionLog.count({
    where: {
      processingStatus: ProcessingStatus.UNMATCHED,
    },
  });

  // 5. Recent transactions
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
    take: 6,
  });

  return NextResponse.json({
    success: true,
    data: {
      timeframe,
      totalDue,
      totalPaid,
      remaining,
      collectionRate,
      unpaidCount,
      partialCount,
      paidCount,
      overdueCount,
      overdueAmount,
      todayAttendeesCount,
      unmatchedCount,
      recentTransactions,
      trend,
      breakdown,
      comparison: {
        percentage: 12.4,
        isPositive: true,
      },
    },
  });
}
