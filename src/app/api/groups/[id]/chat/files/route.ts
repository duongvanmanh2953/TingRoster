import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { ChatService } from '@/server/services/chat.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const files = await ChatService.getSharedFiles(params.id, userId);
    return NextResponse.json({ success: true, data: files });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Không thể tải danh sách tệp' }, { status: 403 });
  }
}
