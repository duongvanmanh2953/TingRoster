import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { ContractService } from '@/server/services/contract.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });

  try {
    const status = req.nextUrl.searchParams.get('status') || undefined;
    const result = await ContractService.getSpaceContracts(params.id, userId, status);
    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Lỗi tải hợp đồng' }, { status: 403 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });

  try {
    const body = await req.json();
    const created = await ContractService.createContract(params.id, userId, body);
    return NextResponse.json({ success: true, data: created });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Lỗi tạo hợp đồng' }, { status: 400 });
  }
}
