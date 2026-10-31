import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { generateSecureToken } from '@/lib/auth/jwt';
import { sendPasswordResetEmail } from '@/lib/mail/emailService';
import { z } from 'zod';

const ForgotPasswordSchema = z.object({
  email: z.string().email('Email không đúng định dạng').toLowerCase().trim(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = ForgotPasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always respond with neutral message to prevent user enumeration attacks
    const neutralResponse = NextResponse.json({
      success: true,
      data: {
        message: 'Nếu địa chỉ email của bạn đã đăng ký trên TingRoster, hướng dẫn đặt lại mật khẩu đã được gửi vào hòm thư.',
      },
    });

    if (!user || user.isLocked || !user.isActive) {
      return neutralResponse;
    }

    const resetToken = generateSecureToken(32);
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    await sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      token: resetToken,
      appUrl,
    });

    return neutralResponse;
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0]?.message }, { status: 400 });
    }
    console.error('Forgot password error:', err);
    return NextResponse.json({ success: false, error: 'Không thể xử lý yêu cầu lúc này.' }, { status: 500 });
  }
}
