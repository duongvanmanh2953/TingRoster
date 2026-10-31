import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { hashPassword } from '@/lib/auth/jwt';
import { sendPasswordChangedAlert } from '@/lib/mail/emailService';
import { z } from 'zod';

const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Mã xác thực không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu mới phải có tối thiểu 8 ký tự'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = ResetPasswordSchema.parse(body);

    const user = await prisma.user.findFirst({
      where: { resetPasswordToken: token },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Mã đặt lại mật khẩu không hợp lệ hoặc đã được sử dụng.' },
        { status: 400 }
      );
    }

    if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Mã đặt lại mật khẩu đã hết hạn (quá 60 phút). Vui lòng gửi lại yêu cầu mới.' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_RESET_COMPLETED',
        entityType: 'USER',
        entityId: user.id,
        details: JSON.stringify({ email: user.email, timestamp: new Date().toISOString() }),
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      },
    });

    // Send security alert
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    await sendPasswordChangedAlert({
      email: user.email,
      name: user.name,
      appUrl,
    });

    return NextResponse.json({
      success: true,
      data: { message: 'Đổi mật khẩu thành công! Bạn có thể dùng mật khẩu mới để đăng nhập ngay.' },
    });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0]?.message }, { status: 400 });
    }
    console.error('Reset password error:', err);
    return NextResponse.json({ success: false, error: 'Đặt lại mật khẩu thất bại.' }, { status: 500 });
  }
}
