import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { ChatService } from '@/server/services/chat.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const groups = await ChatService.getStudentChatGroups(userId);
    return NextResponse.json({ success: true, data: groups });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Không thể tải danh sách nhóm' }, { status: 500 });
  }
}
