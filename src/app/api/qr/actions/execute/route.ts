import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { executeActionQr } from '@/lib/qr/actionEngine';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const ExecuteSchema = z.object({
  token: z.string().min(1, 'Mã token hành động là bắt buộc'),
  notes: z.string().optional(),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Vui lòng đăng nhập tài khoản học viên để thực hiện hành động này',
          requiresAuth: true,
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = ExecuteSchema.parse(body);

    const result = await executeActionQr({
      token: parsed.token,
      userId,
      notes: parsed.notes,
      phone: parsed.phone,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi khi thực hiện hành động';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
