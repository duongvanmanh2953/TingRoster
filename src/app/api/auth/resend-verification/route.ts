import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { generateSecureToken } from '@/lib/auth/jwt';
import { sendVerificationEmail } from '@/lib/mail/emailService';
import { z } from 'zod';

const ResendSchema = z.object({
  email: z.string().email('Email không hợp lệ').toLowerCase().trim(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = ResendSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return neutral message to prevent email enumeration
      return NextResponse.json({
        success: true,
        data: { message: 'Nếu email tồn tại trên hệ thống, thư xác thực đã được gửi lại thành công.' },
      });
    }

    if (user.isEmailVerified) {
      return NextResponse.json({
        success: true,
        data: { isAlreadyVerified: true, message: 'Tài khoản của bạn đã được xác thực trước đó. Bạn có thể đăng nhập ngay.' },
      });
    }

    const verificationToken = generateSecureToken(32);
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    await sendVerificationEmail({
      email: user.email,
      name: user.name,
      token: verificationToken,
      appUrl,
    });

    return NextResponse.json({
      success: true,
      data: { message: 'Thư xác thực mới đã được gửi lại vào email của bạn. Vui lòng kiểm tra hộp thư đến hoặc thư rác.' },
    });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0]?.message }, { status: 400 });
    }
    console.error('Resend verification error:', err);
    return NextResponse.json({ success: false, error: 'Không thể gửi lại email xác thực. Vui lòng thử lại sau.' }, { status: 500 });
  }
}
