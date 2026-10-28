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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, planType: true, role: true },
    });
    if (!user) {
      return NextResponse.json({ success: false, error: 'Người dùng không tồn tại' }, { status: 404 });
    }

    // Check if user is an owner of groups
    const ownedGroups = await prisma.group.findMany({
      where: { userId },
      select: { id: true },
    });
    const ownedGroupIds = ownedGroups.map((g) => g.id);

    // Check if user is a member of groups
    const memberships = await prisma.member.findMany({
      where: { userId },
      select: { groupId: true, group: { select: { userId: true } } },
    });
    const memberGroupIds = memberships.map((m) => m.groupId);

    const allGroupIds = Array.from(new Set([...ownedGroupIds, ...memberGroupIds]));

    // Find conversations
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { workspaceId: userId },
          { groupId: { in: allGroupIds } },
        ],
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Determine entitlement: Pro plan required for Direct Messages
    const directMessagesEnabled = user.planType === 'PRO';

    const formatted = conversations.map((c) => ({
      id: c.id,
      title: c.title,
      type: c.type, // 'ANNOUNCEMENT' | 'GROUP' | 'DIRECT'
      groupId: c.groupId,
      workspaceId: c.workspaceId,
      lastMessage: c.messages[0] || null,
      updatedAt: c.updatedAt,
      isLocked: c.type === 'DIRECT' && !directMessagesEnabled,
    }));

    return NextResponse.json({
      success: true,
      data: {
        conversations: formatted,
        entitlements: {
          groupChatEnabled: true,
          announcementsEnabled: true,
          directMessagesEnabled,
          planType: user.planType,
        },
      },
    });
  } catch (err: unknown) {
    console.error('Chat conversations API error:', err);
    return NextResponse.json({ success: false, error: 'Không thể tải danh sách kênh trò chuyện' }, { status: 500 });
  }
}
