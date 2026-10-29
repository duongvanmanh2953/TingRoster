import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const currentUserId = getUserIdFromRequest(req);
  if (!currentUserId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const q = searchParams.get('q')?.trim() || '';
  const groupId = searchParams.get('groupId')?.trim();
  const cursor = searchParams.get('cursor')?.trim();
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '15', 10), 1), 50);

  try {
    // 1. If groupId provided, verify user has access and fetch enrolled members to mark them
    let enrolledUserIds = new Set<string>();
    let enrolledMemberPhones = new Set<string>();

    if (groupId) {
      const groupMembers = await prisma.member.findMany({
        where: { groupId, status: 'ACTIVE' },
        select: { userId: true, phone: true },
      });
      groupMembers.forEach((m) => {
        if (m.userId) enrolledUserIds.add(m.userId);
        if (m.phone) enrolledMemberPhones.add(m.phone);
      });
    }

    // 2. Build indexed query for Community Users
    const userWhere: any = {};
    if (q) {
      userWhere.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Fetch users with cursor pagination
    const users = await prisma.user.findMany({
      where: userWhere,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
      },
    });

    // 3. Also fetch existing unique Members from current workspace to allow cross-class re-enrollment
    const workspaceMembersWhere: any = {
      group: { userId: currentUserId },
      status: 'ACTIVE',
    };
    if (q) {
      workspaceMembersWhere.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q } },
        { parentName: { contains: q, mode: 'insensitive' } },
      ];
    }

    const workspaceMembers = await prisma.member.findMany({
      where: workspaceMembersWhere,
      take: 10,
      distinct: ['phone', 'name'],
      select: {
        id: true,
        userId: true,
        name: true,
        phone: true,
        parentName: true,
        avatarUrl: true,
        gender: true,
        group: { select: { name: true } },
      },
    });

    const hasMore = users.length > limit;
    const items = hasMore ? users.slice(0, limit) : users;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    // Format output with isEnrolled status
    const formattedUsers = items.map((u) => ({
      id: u.id,
      userId: u.id,
      name: u.name,
      email: u.email,
      avatarUrl: u.avatarUrl || null,
      role: u.role,
      type: 'USER' as const,
      isEnrolled: enrolledUserIds.has(u.id),
    }));

    // Merge distinct workspace members that match search query if not already in user list
    const seenNames = new Set(formattedUsers.map((u) => u.name.toLowerCase()));
    const additionalMembers = workspaceMembers
      .filter((m) => !seenNames.has(m.name.toLowerCase()))
      .map((m) => ({
        id: `member-${m.id}`,
        userId: m.userId || null,
        name: m.name,
        phone: m.phone || null,
        parentName: m.parentName || null,
        avatarUrl: m.avatarUrl || null,
        role: 'MEMBER',
        type: 'MEMBER' as const,
        sourceGroupName: m.group?.name,
        isEnrolled: (m.userId && enrolledUserIds.has(m.userId)) || (m.phone && enrolledMemberPhones.has(m.phone)) || false,
      }));

    return NextResponse.json({
      success: true,
      data: {
        items: [...formattedUsers, ...additionalMembers],
        nextCursor,
        hasMore,
        totalReturned: items.length + additionalMembers.length,
      },
    });
  } catch (err: unknown) {
    console.error('Community members search error:', err);
    return NextResponse.json({ success: false, error: 'Lỗi truy vấn tìm kiếm thành viên' }, { status: 500 });
  }
}
