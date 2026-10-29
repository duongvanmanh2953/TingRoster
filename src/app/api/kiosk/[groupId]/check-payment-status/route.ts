import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const { groupId } = params;
    const url = new URL(req.url);
    const invoiceId = url.searchParams.get('invoiceId');
    const paymentCode = url.searchParams.get('paymentCode');

    if (!invoiceId && !paymentCode) {
      return NextResponse.json(
        { success: false, error: 'Thiếu invoiceId hoặc paymentCode' },
        { status: 400 }
      );
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        groupId,
        OR: [
          invoiceId ? { id: invoiceId } : {},
          paymentCode ? { paymentCode } : {},
        ],
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy hóa đơn' },
        { status: 404 }
      );
    }

    const remainingDue = Math.max(0, invoice.amountDue - invoice.amountPaid);
    const isPaid = invoice.status === 'PAID' || remainingDue === 0;

    return NextResponse.json({
      success: true,
      data: {
        invoiceId: invoice.id,
        paymentCode: invoice.paymentCode,
        title: invoice.title,
        status: invoice.status,
        amountDue: invoice.amountDue,
        amountPaid: invoice.amountPaid,
        remainingDue,
        isPaid,
        paidAt: invoice.paidAt,
        memberName: invoice.member?.name,
      },
    });
  } catch (err) {
    console.error('Kiosk payment status check error:', err);
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi kiểm tra thanh toán' },
      { status: 500 }
    );
  }
}
