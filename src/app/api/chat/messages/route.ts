import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  const conversationId = req.nextUrl.searchParams.get('conversationId');
  if (!conversationId) {
    return NextResponse.json({ success: false, error: 'Thiếu conversationId' }, { status: 400 });
  }

  try {
    const messages = await prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    return NextResponse.json({ success: true, data: messages });
  } catch (err: unknown) {
    console.error('Fetch messages error:', err);
    return NextResponse.json({ success: false, error: 'Không thể tải tin nhắn' }, { status: 500 });
  }
}

const SendMessageSchema = z.object({
  conversationId: z.string().min(1, 'Thiếu conversationId'),
  content: z.string().min(1, 'Nội dung tin nhắn không được để trống').max(2000, 'Tin nhắn quá dài (tối đa 2000 ký tự)'),
});

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const parsed = SendMessageSchema.parse(body);

    const conversation = await prisma.conversation.findUnique({
      where: { id: parsed.conversationId },
    });
    if (!conversation) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy kênh trò chuyện' }, { status: 404 });
    }

    // 1. Entitlement check: DIRECT messages require workspace Pro plan
    if (conversation.type === 'DIRECT') {
      const workspaceOwner = await prisma.user.findUnique({
        where: { id: conversation.workspaceId },
        select: { planType: true },
      });
      if (workspaceOwner?.planType !== 'PRO') {
        return NextResponse.json(
          {
            success: false,
            error: 'FEATURE_LOCKED',
            message: 'Tính năng nhắn tin trực tiếp 1-1 thuộc gói Pro của cơ sở. Vui lòng liên hệ quản trị viên nâng cấp gói.',
          },
          { status: 403 }
        );
      }
    }

    // 2. Channel check: ANNOUNCEMENT channel allows only Owner or Admin to post
    const isOwner = conversation.workspaceId === userId;
    const isAdmin = user.role === 'ADMIN';

    if (conversation.type === 'ANNOUNCEMENT' && !isOwner && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: 'PERMISSION_DENIED',
          message: 'Kênh thông báo chỉ dành cho Giáo viên / Chủ cơ sở phát thanh.',
        },
        { status: 403 }
      );
    }

    // Determine sender role
    let senderRole = 'MEMBER';
    if (isAdmin) senderRole = 'ADMIN';
    else if (isOwner) senderRole = 'OWNER';

    const message = await prisma.chatMessage.create({
      data: {
        conversationId: parsed.conversationId,
        senderId: user.id,
        senderName: user.name,
        senderRole,
        content: parsed.content,
        isAnnouncement: conversation.type === 'ANNOUNCEMENT',
      },
    });

    // Touch conversation updatedAt
    await prisma.conversation.update({
      where: { id: parsed.conversationId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ success: true, data: message });
  } catch (err: unknown) {
    console.error('Send message error:', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Không thể gửi tin nhắn' }, { status: 500 });
  }
}
