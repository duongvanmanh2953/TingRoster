import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { resolveActionQr } from '@/lib/qr/actionEngine';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const ResolveSchema = z.object({
  code: z.string().min(1, 'Mã QR không được để trống'),
});

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    const body = await req.json();
    const parsed = ResolveSchema.parse(body);

    const resolved = await resolveActionQr(parsed.code, userId);

    return NextResponse.json({
      success: resolved.success,
      data: resolved,
      error: resolved.error,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi khi giải mã Action QR';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
