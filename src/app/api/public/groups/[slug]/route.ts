import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    if (!slug) {
      return NextResponse.json({ success: false, error: 'Thiếu slug lớp' }, { status: 400 });
    }

    const group = await prisma.group.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logoUrl: true,
        publicPortalEnabled: true,
        isActive: true,
        user: {
          select: {
            bankId: true,
            bankAccountNo: true,
            bankAccountName: true,
            logoUrl: true,
            name: true,
          },
        },
        members: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            name: true,
          },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!group || !group.isActive || !group.publicPortalEnabled) {
      return NextResponse.json(
        { success: false, error: 'Lớp học không tồn tại hoặc đã khóa cổng công khai' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: group.id,
        name: group.name,
        slug: group.slug,
        description: group.description,
        logoUrl: group.logoUrl,
        workspaceLogoUrl: group.user.logoUrl,
        bank: group.user,
        members: group.members,
      },
    });
  } catch (err) {
    console.error('Public group fetch error:', err);
    return NextResponse.json({ success: false, error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
