import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { hashPassword, signSessionToken, AUTH_COOKIE_NAME } from '@/lib/auth/jwt';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const ActivateStudentSchema = z.object({
  code: z.string().min(3, 'Mã kích hoạt hoặc số điện thoại không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  name: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ActivateStudentSchema.parse(body);

    const rawCode = parsed.code.trim();
    const cleanId = rawCode.replace(/^TR-MEMBER-/, '');

    // 1. Locate the member record by member ID or phone
    const member = await prisma.member.findFirst({
      where: {
        OR: [
          { id: cleanId },
          { id: rawCode },
          { phone: rawCode },
        ],
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        {
          success: false,
          error: 'Không tìm thấy hồ sơ thành viên khớp với mã kích hoạt hoặc số điện thoại này. Vui lòng liên hệ giáo viên/người quản lý.',
        },
        { status: 404 }
      );
    }

    // 2. Check if already activated
    if (member.userId && member.user) {
      return NextResponse.json(
        {
          success: false,
          errorCode: 'ALREADY_ACTIVATED',
          error: `Tài khoản học viên "${member.name}" đã được kích hoạt trước đó. Vui lòng đăng nhập tại trang Đăng nhập.`,
        },
        { status: 400 }
      );
    }

    // 3. Create or find the student user account
    const studentEmail = (parsed.email && parsed.email.trim())
      ? parsed.email.toLowerCase().trim()
      : (member.phone ? `${member.phone.replace(/\D/g, '')}@student.tingroster.vn` : `student.${member.id.slice(-6)}@student.tingroster.vn`);

    // Check if user with this email already exists
    let existingUser = await prisma.user.findUnique({
      where: { email: studentEmail },
    });

    const passwordHash = await hashPassword(parsed.password);

    let studentUser;
    if (existingUser) {
      // Update password hash and link
      studentUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          passwordHash,
          name: parsed.name?.trim() || member.name,
        },
      });
    } else {
      studentUser = await prisma.user.create({
        data: {
          email: studentEmail,
          name: parsed.name?.trim() || member.name,
          passwordHash,
          role: 'USER',
          planType: 'FREE',
          serviceBalance: 0,
          bankId: 'MB',
          bankAccountNo: '0000000000',
          bankAccountName: (parsed.name?.trim() || member.name).toUpperCase(),
        },
      });
    }

    // 4. Link the member to the created user
    await prisma.member.update({
      where: { id: member.id },
      data: {
        userId: studentUser.id,
      },
    });

    // 5. Sign JWT session token for student portal
    const token = signSessionToken({
      userId: studentUser.id,
      email: studentUser.email,
      role: studentUser.role,
      planType: studentUser.planType,
    });

    const response = NextResponse.json({
      success: true,
      message: `Kích hoạt thành công tài khoản cho học viên ${member.name}!`,
      data: {
        userId: studentUser.id,
        name: studentUser.name,
        email: studentUser.email,
        memberId: member.id,
        spaceName: member.group.name,
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
      return NextResponse.json(
        { success: false, error: err.errors[0]?.message },
        { status: 400 }
      );
    }
    console.error('Student activation error:', err);
    return NextResponse.json(
      { success: false, error: 'Lỗi trong quá trình kích hoạt tài khoản học viên' },
      { status: 500 }
    );
  }
}
