import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { resolveActionQr } from '@/lib/qr/actionEngine';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const userId = getUserIdFromRequest(req);
    const { token } = params;

    const resolved = await resolveActionQr(token, userId);

    return NextResponse.json({
      success: resolved.success,
      data: resolved,
      error: resolved.error,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi khi kiểm tra mã Action QR';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    const body = await req.json();

    const updateData: {
      isRevoked?: boolean;
      expiresAt?: Date;
    } = {};

    if (typeof body.isRevoked === 'boolean') {
      updateData.isRevoked = body.isRevoked;
    }

    if (body.extendSeconds && typeof body.extendSeconds === 'number') {
      updateData.expiresAt = new Date(Date.now() + body.extendSeconds * 1000);
    }

    const updated = await prisma.actionQrCode.update({
      where: { token },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: {
        token: updated.token,
        isRevoked: updated.isRevoked,
        expiresAt: updated.expiresAt.toISOString(),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi khi cập nhật Action QR';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
