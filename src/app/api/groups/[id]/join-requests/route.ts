import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const ReviewRequestSchema = z.object({
  requestId: z.string().min(1, 'requestId là bắt buộc'),
  action: z.enum(['APPROVE', 'REJECT']),
  note: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const groupId = params.id;

    // Verify user owns or manages this group
    const group = await prisma.group.findFirst({
      where: { id: groupId, userId },
    });

    if (!group) {
      return NextResponse.json(
        { success: false, error: 'Không có quyền truy cập không gian này' },
        { status: 403 }
      );
    }

    const requests = await prisma.spaceJoinRequest.findMany({
      where: { groupId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: requests,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi máy chủ';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const groupId = params.id;
    const body = await req.json();
    const parsed = ReviewRequestSchema.parse(body);

    const group = await prisma.group.findFirst({
      where: { id: groupId, userId },
    });

    if (!group) {
      return NextResponse.json(
        { success: false, error: 'Không có quyền quản lý không gian này' },
        { status: 403 }
      );
    }

    const joinReq = await prisma.spaceJoinRequest.findFirst({
      where: { id: parsed.requestId, groupId },
      include: { user: true },
    });

    if (!joinReq) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy yêu cầu tham gia' },
        { status: 404 }
      );
    }

    if (joinReq.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: `Yêu cầu này đã được xử lý (${joinReq.status})` },
        { status: 400 }
      );
    }

    if (parsed.action === 'APPROVE') {
      // Transaction: create/link member & mark approved
      await prisma.$transaction(async (tx) => {
        // Check if member already exists
        const existingMember = await tx.member.findFirst({
          where: { groupId, userId: joinReq.userId },
        });

        if (!existingMember) {
          await tx.member.create({
            data: {
              groupId,
              userId: joinReq.userId,
              name: joinReq.userName,
              phone: joinReq.userPhone || joinReq.user.email,
              status: 'ACTIVE',
            },
          });
        }

        await tx.spaceJoinRequest.update({
          where: { id: joinReq.id },
          data: {
            status: 'APPROVED',
            reviewedBy: userId,
            reviewNote: parsed.note || 'Đã duyệt bởi Quản lý',
          },
        });
      });

      return NextResponse.json({
        success: true,
        message: `Đã phê duyệt cho ${joinReq.userName} tham gia không gian!`,
      });
    } else {
      // REJECT
      await prisma.spaceJoinRequest.update({
        where: { id: joinReq.id },
        data: {
          status: 'REJECTED',
          reviewedBy: userId,
          reviewNote: parsed.note || 'Từ chối bởi Quản lý',
        },
      });

      return NextResponse.json({
        success: true,
        message: `Đã từ chối yêu cầu tham gia của ${joinReq.userName}.`,
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi máy chủ';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
