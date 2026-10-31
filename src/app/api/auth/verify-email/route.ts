import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ success: false, code: 'INVALID', error: 'Mã xác thực không hợp lệ.' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, code: 'INVALID', error: 'Liên kết xác thực không tồn tại hoặc đã được sử dụng.' },
        { status: 400 }
      );
    }

    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      return NextResponse.json(
        {
          success: false,
          code: 'EXPIRED',
          email: user.email,
          error: 'Liên kết xác thực đã hết hạn (quá 24 giờ). Vui lòng yêu cầu gửi lại email mới.',
        },
        { status: 400 }
      );
    }

    // Activate user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'EMAIL_VERIFIED',
        entityType: 'USER',
        entityId: user.id,
        details: JSON.stringify({ email: user.email, verifiedAt: new Date().toISOString() }),
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        email: user.email,
        name: user.name,
        message: 'Xác thực địa chỉ email thành công! Bạn có thể đăng nhập vào TingRoster ngay bây giờ.',
      },
    });
  } catch (err) {
    console.error('Verify email error:', err);
    return NextResponse.json({ success: false, error: 'Lỗi xác thực email hệ thống.' }, { status: 500 });
  }
}
