import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { publicToken: string } }
) {
  try {
    const { publicToken } = params;
    if (!publicToken) {
      return NextResponse.json({ success: false, error: 'Thiếu mã token' }, { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { publicToken },
      include: {
        member: { select: { id: true, name: true } },
        group: { select: { id: true, name: true, slug: true } },
        user: { select: { bankId: true, bankAccountNo: true, bankAccountName: true } },
      },
    });

    if (!invoice) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy hóa đơn' }, { status: 404 });
    }

    // Format safe DTO for public view (no sensitive internal fields)
    const publicData = {
      id: invoice.id,
      publicToken: invoice.publicToken,
      paymentCode: invoice.paymentCode,
      title: invoice.title,
      groupName: invoice.group.name,
      memberName: invoice.member.name,
      status: invoice.status,
      amountDue: invoice.amountDue,
      amountPaid: invoice.amountPaid,
      dueDate: invoice.dueDate ? invoice.dueDate.toISOString() : null,
      billingPeriodStart: invoice.billingPeriodStart ? invoice.billingPeriodStart.toISOString() : null,
      billingPeriodEnd: invoice.billingPeriodEnd ? invoice.billingPeriodEnd.toISOString() : null,
      sessionCount: invoice.sessionCount,
      feePerSession: invoice.feePerSession,
      bankId: invoice.user.bankId,
      bankAccountNo: invoice.user.bankAccountNo,
      bankAccountName: invoice.user.bankAccountName,
    };

    return NextResponse.json({ success: true, data: publicData });
  } catch (err) {
    console.error('Public invoice fetch error:', err);
    return NextResponse.json({ success: false, error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
