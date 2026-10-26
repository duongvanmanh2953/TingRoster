import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const { groupId } = params;

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        user: {
          select: {
            bankId: true,
            bankAccountNo: true,
            bankAccountName: true,
          },
        },
        members: {
          where: { status: 'ACTIVE' },
          select: { id: true, name: true },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy nhóm' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        group: {
          id: group.id,
          name: group.name,
          defaultFee: group.defaultFee,
          bankId: group.user.bankId,
          bankAccountNo: group.user.bankAccountNo,
          bankAccountName: group.user.bankAccountName,
        },
        members: group.members,
      },
    });
  } catch (err) {
    console.error('Kiosk API error:', err);
    return NextResponse.json({ success: false, error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
