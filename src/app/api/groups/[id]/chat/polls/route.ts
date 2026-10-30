import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { ChatService } from '@/server/services/chat.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  const auth = await ChatService.verifyMembership(params.id, userId);
  if (!auth.allowed) {
    return NextResponse.json({ success: false, error: auth.reason || 'Không có quyền truy cập' }, { status: 403 });
  }

  const polls = await prisma.groupPoll.findMany({
    where: { conversationId: auth.conversationId },
    include: {
      options: {
        include: {
          _count: { select: { votes: true } },
        },
      },
      votes: {
        where: { userId },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, data: polls });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = await ChatService.createPoll(params.id, userId, {
      question: body.question,
      options: body.options,
      isMultiple: !!body.isMultiple,
    });
    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Không thể tạo bình chọn' }, { status: 400 });
  }
}
