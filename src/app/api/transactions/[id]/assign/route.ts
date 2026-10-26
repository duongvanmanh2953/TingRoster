import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { InvoiceStatus, ProcessingStatus } from '@prisma/client';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const AssignTransactionSchema = z.object({
  invoiceId: z.string().min(1, 'Thiếu invoiceId'),
  note: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const { id: txId } = params;
    const body = await req.json();
    const { invoiceId, note } = AssignTransactionSchema.parse(body);

    const tx = await prisma.transactionLog.findUnique({
      where: { id: txId },
    });

    if (!tx) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy giao dịch' }, { status: 404 });
    }

    if (tx.processingStatus === ProcessingStatus.PROCESSED || tx.matchedInvoiceId) {
      return NextResponse.json({ success: false, error: 'Giao dịch đã được phân bổ' }, { status: 400 });
    }

    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, userId },
      include: { member: true },
    });

    if (!invoice) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy hóa đơn' }, { status: 404 });
    }

    const newAmountPaid = invoice.amountPaid + tx.amount;
    let newStatus: InvoiceStatus = InvoiceStatus.PARTIAL;
    if (newAmountPaid === invoice.amountDue) {
      newStatus = InvoiceStatus.PAID;
    } else if (newAmountPaid > invoice.amountDue) {
      newStatus = InvoiceStatus.OVERPAID;
    }

    // Atomic manual match
    await prisma.$transaction(async (pTx) => {
      // 1. Update TransactionLog
      await pTx.transactionLog.update({
        where: { id: txId },
        data: {
          matchedInvoiceId: invoice.id,
          userId,
          processingStatus: ProcessingStatus.MATCHED,
          failureReason: null,
        },
      });

      // 2. Create PaymentAllocation
      await pTx.paymentAllocation.create({
        data: {
          transactionLogId: txId,
          invoiceId: invoice.id,
          amount: tx.amount,
        },
      });

      // 3. Update Invoice
      await pTx.invoice.update({
        where: { id: invoice.id },
        data: {
          amountPaid: newAmountPaid,
          status: newStatus,
          paidAt:
            newStatus === InvoiceStatus.PAID || newStatus === InvoiceStatus.OVERPAID
              ? tx.transactionDate
              : invoice.paidAt,
        },
      });

      // 4. AuditLog
      await pTx.auditLog.create({
        data: {
          userId,
          action: 'MANUAL_RECONCILE',
          entityType: 'INVOICE',
          entityId: invoice.id,
          details: JSON.stringify({
            transactionLogId: txId,
            assignedAmount: tx.amount,
            oldStatus: invoice.status,
            newStatus,
            note,
          }),
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Đã gán giao dịch cho học viên ${invoice.member.name}`,
    });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0]?.message }, { status: 400 });
    }
    console.error('Assign transaction error:', err);
    return NextResponse.json({ success: false, error: 'Lỗi gán giao dịch thủ công' }, { status: 500 });
  }
}
