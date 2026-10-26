import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { normalizeTransferContent } from '@/lib/reconciliation/payment-code';
import { formatVND } from '@/lib/utils';
import { InvoiceStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const { transactionLogId } = await req.json();

    const tx = await prisma.transactionLog.findUnique({
      where: { id: transactionLogId },
    });

    if (!tx) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy giao dịch' }, { status: 404 });
    }

    const normContent = normalizeTransferContent(tx.content);

    // Find candidate unpaid/partial invoices
    const candidateInvoices = await prisma.invoice.findMany({
      where: {
        userId,
        status: { in: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIAL] },
      },
      include: {
        member: { select: { id: true, name: true, phone: true } },
        group: { select: { id: true, name: true } },
      },
      take: 20,
    });

    const suggestions = [];

    for (const inv of candidateInvoices) {
      let score = 0;
      const reasons: string[] = [];

      const remaining = inv.amountDue - inv.amountPaid;

      // 1. Amount matching
      if (tx.amount === remaining) {
        score += 50;
        reasons.push(`Số tiền chuyển khoản (${formatVND(tx.amount)}) khớp chính xác 100% số tiền còn nợ của phiếu thu`);
      } else if (tx.amount === inv.amountDue) {
        score += 40;
        reasons.push(`Số tiền khớp với tổng mức phí gốc (${formatVND(inv.amountDue)})`);
      }

      // 2. Name matching
      const normMemberName = normalizeTransferContent(inv.member.name);
      const nameParts = normMemberName.split(/\s+/);
      const lastWord = nameParts[nameParts.length - 1]; // Vietnamese given name (e.g. "AN", "MAI")

      if (normContent.includes(normMemberName)) {
        score += 45;
        reasons.push(`Nội dung chuyển khoản chứa trọn vẹn họ tên "${inv.member.name}"`);
      } else if (lastWord && lastWord.length > 1 && normContent.includes(lastWord)) {
        score += 25;
        reasons.push(`Nội dung chuyển khoản chứa tên gọi "${lastWord}"`);
      }

      // 3. Class name matching
      const normGroupName = normalizeTransferContent(inv.group.name);
      if (normContent.includes(normGroupName)) {
        score += 15;
        reasons.push(`Có nhắc đến tên lớp "${inv.group.name}"`);
      }

      if (score >= 40) {
        suggestions.push({
          invoiceId: inv.id,
          memberName: inv.member.name,
          groupName: inv.group.name,
          paymentCode: inv.paymentCode,
          amountDue: inv.amountDue,
          amountPaid: inv.amountPaid,
          remaining,
          confidence: Math.min(99, score),
          reasons,
        });
      }
    }

    // Sort by confidence descending
    suggestions.sort((a, b) => b.confidence - a.confidence);

    return NextResponse.json({
      success: true,
      data: {
        transactionId: tx.id,
        txAmount: tx.amount,
        txContent: tx.content,
        suggestions: suggestions.slice(0, 3),
      },
    });
  } catch (err) {
    console.error('Reconciliation Advisor error:', err);
    return NextResponse.json({ success: false, error: 'Lỗi phân tích đối soát' }, { status: 500 });
  }
}
