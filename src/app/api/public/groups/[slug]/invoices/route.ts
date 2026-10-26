import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const memberId = req.nextUrl.searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Thiếu memberId' }, { status: 400 });
    }

    const group = await prisma.group.findUnique({
      where: { slug },
      select: { id: true, publicPortalEnabled: true },
    });

    if (!group || !group.publicPortalEnabled) {
      return NextResponse.json({ success: false, error: 'Lớp học không khả dụng' }, { status: 404 });
    }

    // Find latest active invoice for member in this group
    const invoice = await prisma.invoice.findFirst({
      where: {
        groupId: group.id,
        memberId,
        status: { in: ['UNPAID', 'PARTIAL', 'PAID', 'OVERPAID'] },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        publicToken: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ success: false, error: 'Chưa có phiếu thu nào cho học viên này' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { publicToken: invoice.publicToken } });
  } catch (err) {
    console.error('Group member invoice fetch error:', err);
    return NextResponse.json({ success: false, error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
