import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const SettingsSchema = z.object({
  name: z.string().min(2).optional(),
  bankId: z.string().min(2).optional(),
  bankAccountNo: z.string().min(6).optional(),
  bankAccountName: z.string().min(2).optional(),
});

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      bankId: true,
      bankAccountNo: true,
      bankAccountName: true,
      planType: true,
    },
  });

  return NextResponse.json({ success: true, data: user });
}

export async function PATCH(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = SettingsSchema.parse(body);

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name: parsed.name?.trim(),
        bankId: parsed.bankId?.trim().toUpperCase(),
        bankAccountNo: parsed.bankAccountNo?.trim(),
        bankAccountName: parsed.bankAccountName?.trim().toUpperCase(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        bankId: true,
        bankAccountNo: true,
        bankAccountName: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Lỗi cập nhật cấu hình' }, { status: 500 });
  }
}
