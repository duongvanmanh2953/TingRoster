import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { hashPassword, signSessionToken, AUTH_COOKIE_NAME } from '@/lib/auth/jwt';
import { z } from 'zod';

const RegisterSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  name: z.string().min(2, 'Họ tên tối thiểu 2 ký tự'),
  bankId: z.string().default('MB'),
  bankAccountNo: z.string().min(6, 'Số tài khoản không hợp lệ'),
  bankAccountName: z.string().min(2, 'Tên chủ tài khoản không hợp lệ'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: parsed.email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Email này đã được đăng ký' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(parsed.password);

    const user = await prisma.user.create({
      data: {
        email: parsed.email.toLowerCase().trim(),
        name: parsed.name.trim(),
        passwordHash,
        bankId: parsed.bankId.toUpperCase().trim(),
        bankAccountNo: parsed.bankAccountNo.trim(),
        bankAccountName: parsed.bankAccountName.toUpperCase().trim(),
      },
    });

    const token = signSessionToken({
      userId: user.id,
      email: user.email,
      planType: user.planType,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        planType: user.planType,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0]?.message }, { status: 400 });
    }
    console.error('Register error:', err);
    return NextResponse.json({ success: false, error: 'Đăng ký thất bại' }, { status: 500 });
  }
}
