import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { PolicyPricingService } from '@/server/services/policyPricing.service';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getUserIdFromRequest(req);
  try {
    const clauses = await PolicyPricingService.getSpaceClauses(params.id, userId || undefined);
    return NextResponse.json({ success: true, data: clauses });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Lỗi tải điều khoản' }, { status: 400 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });

  try {
    const body = await req.json();

    // Check if it's an acceptance from student
    if (body.action === 'accept' && body.clauseId) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
      const acceptance = await PolicyPricingService.acceptClause(
        body.clauseId,
        userId,
        user?.name || 'Thành viên',
        req.headers.get('x-forwarded-for') || '127.0.0.1'
      );
      return NextResponse.json({ success: true, data: acceptance });
    }

    // Owner creates or updates clause
    const clause = await PolicyPricingService.updateClause(
      userId,
      {
        groupId: params.id,
        clauseType: body.clauseType,
        title: body.title,
        content: body.content,
        requiresReacceptance: !!body.requiresReacceptance,
      },
      body.changeReason
    );
    return NextResponse.json({ success: true, data: clause });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Lỗi thao tác điều khoản' }, { status: 400 });
  }
}
