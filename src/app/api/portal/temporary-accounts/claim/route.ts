import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { TemporaryAccountService } from '@/server/services/temporaryAccount.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code') || req.nextUrl.searchParams.get('token');
  if (!code) {
    return NextResponse.json({ success: false, error: 'Thiếu mã hoặc liên kết kích hoạt' }, { status: 400 });
  }

  const resolved = await TemporaryAccountService.resolveAccount(code);
  return NextResponse.json({ success: true, data: resolved });
}

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ success: false, error: 'Vui lòng đăng nhập hoặc đăng ký để tiếp nhận tài khoản' }, { status: 401 });

  try {
    const body = await req.json();
    if (!body.code && !body.token) {
      return NextResponse.json({ success: false, error: 'Thiếu mã kích hoạt' }, { status: 400 });
    }

    const claimed = await TemporaryAccountService.claimTemporaryAccount(body.code || body.token, userId);
    return NextResponse.json({ success: true, data: claimed });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Lỗi tiếp nhận tài khoản' }, { status: 400 });
  }
}
