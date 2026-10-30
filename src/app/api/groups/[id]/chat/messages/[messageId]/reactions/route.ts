import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { ChatService } from '@/server/services/chat.service';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; messageId: string } }
) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.emoji || typeof body.emoji !== 'string') {
      return NextResponse.json({ success: false, error: 'Thiếu emoji reaction' }, { status: 400 });
    }

    const result = await ChatService.toggleReaction(params.id, params.messageId, userId, body.emoji);
    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Lỗi thả reaction' }, { status: 400 });
  }
}
