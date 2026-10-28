import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    // Find all member IDs for this user
    const members = await prisma.member.findMany({
      where: { userId },
      select: { id: true, name: true, groupId: true },
    });

    const memberIds = members.map((m) => m.id);
    if (memberIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const groupIdFilter = req.nextUrl.searchParams.get('groupId');
    const statusFilter = req.nextUrl.searchParams.get('status');

    const whereClause: Record<string, unknown> = {
      memberId: { in: memberIds },
    };
    if (groupIdFilter) whereClause.groupId = groupIdFilter;
    if (statusFilter) whereClause.status = statusFilter;

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: {
        group: { select: { id: true, name: true, slug: true, groupType: true } },
        member: { select: { id: true, name: true, phone: true } },
        user: { select: { name: true, bankId: true, bankAccountNo: true, bankAccountName: true } },
        allocations: {
          select: {
            id: true,
            amount: true,
            createdAt: true,
            transactionLog: {
              select: {
                providerTransactionId: true,
                transactionDate: true,
                provider: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format with parsed line items and VietQR payload
    const formattedInvoices = invoices.map((inv) => {
      let parsedMetadata: Record<string, unknown> = {};
      try {
        if (inv.metadata) {
          parsedMetadata = JSON.parse(inv.metadata);
        }
      } catch {
        parsedMetadata = {};
      }

      const remainingAmount = Math.max(0, inv.amountDue - inv.amountPaid);
      const bankId = inv.user.bankId || 'MB';
      const accountNo = inv.user.bankAccountNo || '0987654321';
      const accountName = encodeURIComponent(inv.user.bankAccountName || 'NGUYEN VAN TUAN');
      const memo = encodeURIComponent(inv.paymentCode);
      const vietQrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${remainingAmount}&addInfo=${memo}&accountName=${accountName}`;

      return {
        id: inv.id,
        title: inv.title,
        paymentCode: inv.paymentCode,
        publicToken: inv.publicToken,
        amountDue: inv.amountDue,
        amountPaid: inv.amountPaid,
        remainingAmount,
        status: inv.status,
        dueDate: inv.dueDate,
        createdAt: inv.createdAt,
        group: inv.group,
        member: inv.member,
        recipient: {
          name: inv.user.name,
          bankId,
          bankAccountNo: accountNo,
          bankAccountName: inv.user.bankAccountName,
        },
        vietQrUrl,
        lineItems: (parsedMetadata.lineItems as unknown[]) || [
          {
            id: '1',
            name: inv.title,
            qty: 1,
            unit: 'khoản',
            unitPrice: inv.amountDue,
            discount: 0,
            total: inv.amountDue,
            note: 'Khoản thu theo định kỳ cơ sở',
          },
        ],
        partialPaymentAllowed: Boolean(parsedMetadata.partialPaymentAllowed),
        minPartialAmount: Number(parsedMetadata.minPartialAmount) || 0,
        documentType: (parsedMetadata.documentType as string) || 'INTERNAL_STATEMENT',
        statementNumber: (parsedMetadata.statementNumber as string) || `BK-${inv.paymentCode}`,
        allocations: inv.allocations,
      };
    });

    return NextResponse.json({ success: true, data: formattedInvoices });
  } catch (err: unknown) {
    console.error('Portal fees API error:', err);
    return NextResponse.json({ success: false, error: 'Không thể tải danh sách khoản phí' }, { status: 500 });
  }
}
