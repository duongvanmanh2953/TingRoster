import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { TemporaryAccountService } from '@/server/services/temporaryAccount.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });

  try {
    const result = await TemporaryAccountService.getSpaceTemporaryAccounts(params.id, userId);
    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Lỗi tải tài khoản tạm' }, { status: 403 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });

  try {
    const body = await req.json();
    if (Array.isArray(body.batch)) {
      const result = await TemporaryAccountService.createBatchTemporaryAccounts(params.id, userId, body.batch);
      return NextResponse.json({ success: true, data: result });
    } else {
      const result = await TemporaryAccountService.createTemporaryAccount(params.id, userId, body);
      return NextResponse.json({ success: true, data: result });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Lỗi tạo tài khoản tạm' }, { status: 400 });
  }
}
