import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { generateUniquePaymentCode } from '@/lib/reconciliation/payment-code';
import { InvoiceStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const { groupId } = params;
    const { memberId } = await req.json();

    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Thiếu memberId' }, { status: 400 });
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { user: true },
    });

    if (!group) {
      return NextResponse.json({ success: false, error: 'Nhóm không tồn tại' }, { status: 404 });
    }

    const member = await prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      return NextResponse.json({ success: false, error: 'Thành viên không tồn tại' }, { status: 404 });
    }

    // Check if member already has an unpaid/partial invoice today for this group
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        groupId,
        memberId,
        createdAt: { gte: today },
        status: { in: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIAL] },
      },
    });

    if (existingInvoice) {
      return NextResponse.json({
        success: true,
        data: {
          id: existingInvoice.id,
          publicToken: existingInvoice.publicToken,
          paymentCode: existingInvoice.paymentCode,
          amountDue: existingInvoice.amountDue,
          amountPaid: existingInvoice.amountPaid,
          status: existingInvoice.status,
          memberName: member.name,
        },
      });
    }

    // Generate unique payment code
    const paymentCode = await generateUniquePaymentCode();
    const fee = group.defaultFee > 0 ? group.defaultFee : 50000;

    const newInvoice = await prisma.invoice.create({
      data: {
        groupId,
        memberId,
        userId: group.userId,
        title: `Phí sân - ${member.name} (${new Date().toLocaleDateString('vi-VN')})`,
        amountDue: fee,
        amountPaid: 0,
        paymentCode,
        status: InvoiceStatus.UNPAID,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: newInvoice.id,
        publicToken: newInvoice.publicToken,
        paymentCode: newInvoice.paymentCode,
        amountDue: newInvoice.amountDue,
        amountPaid: newInvoice.amountPaid,
        status: newInvoice.status,
        memberName: member.name,
      },
    });
  } catch (err) {
    console.error('Kiosk ticket error:', err);
    return NextResponse.json({ success: false, error: 'Lỗi tạo vé kiosk' }, { status: 500 });
  }
}
