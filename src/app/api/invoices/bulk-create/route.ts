import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { generateUniquePaymentCode } from '@/lib/reconciliation/payment-code';
import { AttendanceStatus, InvoiceStatus } from '@prisma/client';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const BulkCreateInvoiceSchema = z.object({
  groupId: z.string().min(1, 'Thiếu groupId'),
  title: z.string().min(2, 'Tiêu đề kỳ thu không được để trống'),
  pricingType: z.enum(['FIXED', 'PER_SESSION']),
  fixedAmount: z.number().int().nonnegative().optional(),
  feePerSession: z.number().int().nonnegative().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = BulkCreateInvoiceSchema.parse(body);

    const group = await prisma.group.findFirst({
      where: { id: parsed.groupId, userId },
      include: {
        members: { where: { status: 'ACTIVE' } },
      },
    });

    if (!group) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy nhóm' }, { status: 404 });
    }

    if (group.members.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nhóm chưa có học viên nào đang hoạt động' },
        { status: 400 }
      );
    }

    const startDateTime = parsed.startDate ? new Date(parsed.startDate) : undefined;
    const endDateTime = parsed.endDate ? new Date(parsed.endDate) : undefined;
    const dueDateTime = parsed.dueDate ? new Date(parsed.dueDate) : undefined;

    // If PER_SESSION, calculate session counts for each member in range
    const memberSessionCounts = new Map<string, number>();

    if (parsed.pricingType === 'PER_SESSION' && startDateTime && endDateTime) {
      const attendances = await prisma.attendance.findMany({
        where: {
          groupId: parsed.groupId,
          date: { gte: startDateTime, lte: endDateTime },
          status: { in: [AttendanceStatus.PRESENT, AttendanceStatus.ABSENT_CHARGED] },
        },
      });

      for (const att of attendances) {
        const count = memberSessionCounts.get(att.memberId) || 0;
        memberSessionCounts.set(att.memberId, count + 1);
      }
    }

    // Prepare invoice items with unique payment codes
    const invoicesToCreate = [];
    for (const member of group.members) {
      let amountDue = 0;
      let sessionCount = 0;
      const unitFee = parsed.feePerSession || group.defaultFee || 0;

      if (parsed.pricingType === 'FIXED') {
        amountDue = parsed.fixedAmount ?? group.defaultFee;
      } else {
        sessionCount = memberSessionCounts.get(member.id) || 0;
        amountDue = sessionCount * unitFee;
      }

      // Skip 0 VND invoice if no sessions attended and not fixed
      if (amountDue <= 0 && parsed.pricingType === 'PER_SESSION') {
        continue;
      }

      const paymentCode = await generateUniquePaymentCode();

      invoicesToCreate.push({
        memberId: member.id,
        groupId: group.id,
        userId,
        title: `${parsed.title} - ${member.name}`,
        amountDue: Math.max(0, Math.floor(amountDue)),
        amountPaid: 0,
        paymentCode,
        status: InvoiceStatus.UNPAID,
        dueDate: dueDateTime,
        billingPeriodStart: startDateTime,
        billingPeriodEnd: endDateTime,
        sessionCount,
        feePerSession: unitFee,
      });
    }

    if (invoicesToCreate.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Không có thành viên nào phát sinh học phí trong kỳ này' },
        { status: 400 }
      );
    }

    // Atomic creation
    const createdInvoices = await prisma.$transaction(
      invoicesToCreate.map((inv) => prisma.invoice.create({ data: inv }))
    );

    return NextResponse.json({
      success: true,
      count: createdInvoices.length,
      data: createdInvoices,
    });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0]?.message }, { status: 400 });
    }
    console.error('Bulk invoice creation error:', err);
    return NextResponse.json({ success: false, error: 'Lỗi tạo đợt thu' }, { status: 500 });
  }
}
