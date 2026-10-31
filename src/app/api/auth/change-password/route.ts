import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerSession, hashPassword, verifyPassword } from '@/lib/auth/jwt';
import { sendPasswordChangedAlert } from '@/lib/mail/emailService';
import { z } from 'zod';

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  newPassword: z.string().min(8, 'Mật khẩu mới phải có tối thiểu 8 ký tự'),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, newPassword } = ChangePasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.id },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy tài khoản' }, { status: 404 });
    }

    const isMatch = await verifyPassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ success: false, error: 'Mật khẩu hiện tại không chính xác' }, { status: 400 });
    }

    const newPasswordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_CHANGED',
        entityType: 'USER',
        entityId: user.id,
        details: JSON.stringify({ email: user.email, timestamp: new Date().toISOString() }),
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    await sendPasswordChangedAlert({
      email: user.email,
      name: user.name,
      appUrl,
    });

    return NextResponse.json({
      success: true,
      data: { message: 'Đổi mật khẩu thành công.' },
    });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0]?.message }, { status: 400 });
    }
    console.error('Change password error:', err);
    return NextResponse.json({ success: false, error: 'Lỗi khi cập nhật mật khẩu.' }, { status: 500 });
  }
}
