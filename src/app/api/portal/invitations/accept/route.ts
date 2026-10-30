import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const AcceptInvitationSchema = z.object({
  inviteCode: z.string().min(1, 'Mã lời mời không được để trống'),
});

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'Vui lòng đăng nhập tài khoản học viên để chấp nhận lời mời' },
      { status: 401 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy tài khoản người dùng' }, { status: 404 });
    }

    const body = await req.json();
    const parsed = AcceptInvitationSchema.parse(body);
    const code = parsed.inviteCode.trim();

    // 1. Check if the code is a member activation token (TR-MEMBER-XXXXXX)
    if (code.toUpperCase().startsWith('TR-MEMBER-')) {
      const suffix = code.slice(10).toLowerCase();

      // Find member matching suffix of ID or exact note
      const members = await prisma.member.findMany({
        include: { group: true },
      });

      const matchedMember = members.find((m) => m.id.toLowerCase().endsWith(suffix));

      if (!matchedMember) {
        return NextResponse.json(
          { success: false, error: 'Mã thành viên không tồn tại hoặc đã hết hạn' },
          { status: 404 }
        );
      }

      // Link member to this user
      await prisma.member.update({
        where: { id: matchedMember.id },
        data: { userId: user.id },
      });

      return NextResponse.json({
        success: true,
        message: `Đã liên kết thành công với không gian "${matchedMember.group.name}"`,
        data: {
          group: {
            id: matchedMember.group.id,
            name: matchedMember.group.name,
            slug: matchedMember.group.slug,
          },
          memberId: matchedMember.id,
        },
      });
    }

    // 2. Check if the code matches a Space/Group slug or ID
    const group = await prisma.group.findFirst({
      where: {
        OR: [{ id: code }, { slug: code }],
      },
    });

    if (!group) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy không gian hoặc lớp học với mã lời mời này' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const existingMember = await prisma.member.findFirst({
      where: {
        groupId: group.id,
        userId: user.id,
      },
    });

    if (existingMember) {
      return NextResponse.json({
        success: true,
        message: `Bạn đã là thành viên của không gian "${group.name}"`,
        data: {
          group: { id: group.id, name: group.name, slug: group.slug },
          memberId: existingMember.id,
        },
      });
    }

    // Query if user has an existing phone from another member profile
    const existingProfile = await prisma.member.findFirst({
      where: { userId: user.id, phone: { not: null } },
      select: { phone: true },
    });
    const userPhone = existingProfile?.phone || null;

    let targetMember = null;
    if (userPhone) {
      targetMember = await prisma.member.findFirst({
        where: {
          groupId: group.id,
          phone: userPhone,
          userId: null,
        },
      });
    }

    if (targetMember) {
      // Link existing member record
      await prisma.member.update({
        where: { id: targetMember.id },
        data: { userId: user.id },
      });
    } else {
      // Create new member record in the group
      targetMember = await prisma.member.create({
        data: {
          groupId: group.id,
          userId: user.id,
          name: user.name,
          phone: userPhone,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Đã tham gia không gian "${group.name}" thành công!`,
      data: {
        group: { id: group.id, name: group.name, slug: group.slug },
        memberId: targetMember.id,
      },
    });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0]?.message }, { status: 400 });
    }
    console.error('Accept invitation error:', err);
    return NextResponse.json({ success: false, error: 'Lỗi khi xử lý mã tham gia' }, { status: 500 });
  }
}
