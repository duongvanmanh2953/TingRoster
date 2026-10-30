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
    const body = await req.json();
    if (!body.optionId) {
      return NextResponse.json({ success: false, error: 'Thiếu optionId' }, { status: 400 });
    }

    const updatedPoll = await ChatService.votePoll(params.id, params.pollId, body.optionId, userId);
    return NextResponse.json({ success: true, data: updatedPoll });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Lỗi bình chọn' }, { status: 400 });
  }
}
