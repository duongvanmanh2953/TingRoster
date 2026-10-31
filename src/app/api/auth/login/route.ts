import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyPassword, signSessionToken, AUTH_COOKIE_NAME } from '@/lib/auth/jwt';
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().email('Email không đúng định dạng').toLowerCase().trim(),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: parsed.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Email hoặc mật khẩu không chính xác' },
        { status: 401 }
      );
    }

    if (user.isLocked) {
      return NextResponse.json(
        {
          success: false,
          error: `Tài khoản đã bị tạm khóa vì lý do an toàn. ${user.lockReason ? `Lý do: ${user.lockReason}` : 'Vui lòng liên hệ ban quản trị để được hỗ trợ.'}`,
        },
        { status: 403 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.' },
        { status: 403 }
      );
    }

    const isValid = await verifyPassword(parsed.password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Email hoặc mật khẩu không chính xác' },
        { status: 401 }
      );
    }

    // Check email verification status
    if (!user.isEmailVerified) {
      return NextResponse.json(
        {
          success: false,
          isUnverified: true,
          email: user.email,
          error: 'Tài khoản chưa xác thực email. Vui lòng kiểm tra hộp thư hoặc bấm gửi lại liên kết xác thực.',
        },
        { status: 403 }
      );
    }

    // Update lastLoginAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = signSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      planType: user.planType,
      isEmailVerified: user.isEmailVerified,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
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
    console.error('Login error:', err);
    return NextResponse.json({ success: false, error: 'Đăng nhập thất bại. Vui lòng thử lại.' }, { status: 500 });
  }
}
