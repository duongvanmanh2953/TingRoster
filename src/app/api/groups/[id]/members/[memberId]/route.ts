import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; memberId: string } }
) {
  const currentUserId = getUserIdFromRequest(req);
  if (!currentUserId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  const { id: groupId, memberId } = params;

  try {
    // 1. Verify group ownership
    const group = await prisma.group.findFirst({
      where: { id: groupId, userId: currentUserId },
      select: { id: true, name: true },
    });

    if (!group) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy nhóm hoặc bạn không có quyền' }, { status: 404 });
    }

    // 2. Verify member exists in this group
    const member = await prisma.member.findFirst({
      where: { id: memberId, groupId },
      select: { id: true, name: true, userId: true },
    });

    if (!member) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy thành viên trong nhóm này' }, { status: 404 });
    }

    // 3. Soft remove from group (sets INACTIVE, preserves historical invoices & attendances)
    await prisma.$transaction(async (tx) => {
      await tx.member.update({
        where: { id: memberId },
        data: { status: 'INACTIVE' },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          userId: currentUserId,
          action: 'REMOVE_MEMBER_FROM_GROUP',
          entityType: 'Member',
          entityId: memberId,
          details: JSON.stringify({
            memberName: member.name,
            groupId,
            groupName: group.name,
            timestamp: new Date().toISOString(),
          }),
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Đã gỡ học viên ${member.name} khỏi nhóm thành công. Toàn bộ lịch sử đóng phí và điểm danh trước đây vẫn được lưu trữ nguyên vẹn.`,
    });
  } catch (err: unknown) {
    console.error('Remove member from group error:', err);
    return NextResponse.json({ success: false, error: 'Lỗi khi gỡ thành viên khỏi nhóm' }, { status: 500 });
  }
}
