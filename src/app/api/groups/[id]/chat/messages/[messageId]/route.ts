import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { ChatService } from '@/server/services/chat.service';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; messageId: string } }
) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (body.action === 'pin' || typeof body.isPinned === 'boolean') {
      const updated = await ChatService.togglePin(params.id, params.messageId, userId);
      return NextResponse.json({ success: true, data: updated });
    }

    if (typeof body.content === 'string') {
      const updated = await ChatService.editMessage(params.id, params.messageId, userId, body.content);
      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ success: false, error: 'Thao tác không hợp lệ' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Lỗi thao tác' }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; messageId: string } }
) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const deleted = await ChatService.deleteMessage(params.id, params.messageId, userId);
    return NextResponse.json({ success: true, data: deleted });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Lỗi thu hồi tin nhắn' }, { status: 400 });
  }
}
