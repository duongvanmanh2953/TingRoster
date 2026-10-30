import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { ChatService } from '@/server/services/chat.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  const cursor = req.nextUrl.searchParams.get('cursor');
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '30', 10);
  const search = req.nextUrl.searchParams.get('search');
  const pinnedOnly = req.nextUrl.searchParams.get('pinnedOnly') === 'true';

  try {
    const result = await ChatService.getMessages(params.id, userId, {
      cursor,
      limit,
      search,
      pinnedOnly,
    });
    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Không thể tải tin nhắn' }, { status: 403 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const created = await ChatService.sendMessage(params.id, userId, body);
    return NextResponse.json({ success: true, data: created });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Không thể gửi tin nhắn' }, { status: 400 });
  }
}
