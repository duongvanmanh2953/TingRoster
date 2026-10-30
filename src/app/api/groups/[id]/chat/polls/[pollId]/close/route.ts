import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { ChatService } from '@/server/services/chat.service';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; pollId: string } }
) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const closed = await ChatService.closePoll(params.id, params.pollId, userId);
    return NextResponse.json({ success: true, data: closed });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Lỗi đóng bình chọn' }, { status: 400 });
  }
}
