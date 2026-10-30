import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { ContractService } from '@/server/services/contract.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });

  try {
    const groupId = req.nextUrl.searchParams.get('groupId') || undefined;
    const contracts = await ContractService.getStudentContracts(userId, groupId);
    return NextResponse.json({ success: true, data: contracts });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Lỗi tải hợp đồng của bạn' }, { status: 500 });
  }
}
