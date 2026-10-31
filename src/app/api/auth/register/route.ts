import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { hashPassword, generateSecureToken } from '@/lib/auth/jwt';
import { sendVerificationEmail } from '@/lib/mail/emailService';
import { z } from 'zod';

const RegisterSchema = z.object({
  email: z.string().email('Địa chỉ email không hợp lệ').toLowerCase().trim(),
  password: z.string().min(8, 'Mật khẩu phải có tối thiểu 8 ký tự'),
  name: z.string().min(2, 'Vui lòng nhập họ và tên đầy đủ'),
  bankId: z.string().optional().default('MB'),
  bankAccountNo: z.string().optional().default('0987654321'),
  bankAccountName: z.string().optional().default('NGUYEN VAN A'),
  agreeTerms: z.boolean().refine(val => val === true, {
    message: 'Bạn cần đồng ý với Điều khoản sử dụng và Chính sách bảo mật',
  }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: parsed.email },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Email này đã tồn tại trong hệ thống. Vui lòng đăng nhập hoặc dùng email khác.' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(parsed.password);
    const verificationToken = generateSecureToken(32);
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await prisma.user.create({
      data: {
        email: parsed.email,
        name: parsed.name.trim(),
        passwordHash,
        bankId: parsed.bankId.toUpperCase().trim(),
        bankAccountNo: parsed.bankAccountNo.trim(),
        bankAccountName: parsed.bankAccountName.toUpperCase().trim(),
        isEmailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
        role: 'USER',
      },
    });

    // Send verification email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    await sendVerificationEmail({
      email: user.email,
      name: user.name,
      token: verificationToken,
      appUrl,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        isEmailVerified: false,
        message: 'Đăng ký tài khoản thành công! Chúng tôi đã gửi email xác thực đến hòm thư của bạn.',
      },
    });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0]?.message }, { status: 400 });
    }
    console.error('Register error:', err);
    return NextResponse.json({ success: false, error: 'Đăng ký thất bại. Vui lòng thử lại sau.' }, { status: 500 });
  }
}
