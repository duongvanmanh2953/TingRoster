import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { SurchargeService } from '@/server/services/surcharge.service';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; surchargeId: string } }
) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });

  try {
    const body = await req.json();
    if (body.action === 'CONVERT_TO_INVOICE') {
      const invoice = await SurchargeService.convertToInvoice(params.surchargeId, userId);
      return NextResponse.json({ success: true, data: invoice });
    }

    return NextResponse.json({ success: false, error: 'Hành động không hợp lệ' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Lỗi xử lý phụ thu' }, { status: 400 });
  }
}
