import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { PolicyPricingService } from '@/server/services/policyPricing.service';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const histories = await PolicyPricingService.getPricingHistories(params.id);
    return NextResponse.json({ success: true, data: histories });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Lỗi tải lịch sử giá' }, { status: 400 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
    const body = await req.json();

    const history = await PolicyPricingService.updatePriceWithHistory(userId, user?.name || 'Quản lý', {
      groupId: params.id,
      itemType: body.itemType || 'DEFAULT_FEE',
      itemId: body.itemId,
      itemName: body.itemName || 'Mức phí cơ sở',
      newPrice: Number(body.newPrice),
      reason: body.reason || 'Điều chỉnh định kỳ',
    });

    return NextResponse.json({ success: true, data: history });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Lỗi cập nhật giá' }, { status: 400 });
  }
}
