import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const whereClause: Record<string, unknown> = {};
    if (user?.role !== 'ADMIN') {
      whereClause.userId = userId;
    }

    const tickets = await prisma.supportTicket.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: tickets });
  } catch (err: unknown) {
    console.error('Fetch support tickets error:', err);
    return NextResponse.json({ success: false, error: 'Không thể tải danh sách phiếu hỗ trợ' }, { status: 500 });
  }
}

const CreateTicketSchema = z.object({
  category: z.enum(['BUG', 'FEATURE', 'BILLING', 'GENERAL']),
  subject: z.string().min(5, 'Tiêu đề phiếu phải từ 5 ký tự'),
  description: z.string().min(10, 'Mô tả chi tiết phải từ 10 ký tự'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional().default('NORMAL'),
});

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = CreateTicketSchema.parse(body);

    const ticketCode = `TK-${Math.floor(10000 + Math.random() * 90000)}`;

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketCode,
        userId,
        category: parsed.category,
        subject: parsed.subject,
        description: parsed.description,
        priority: parsed.priority,
        status: 'OPEN',
      },
    });

    return NextResponse.json({
      success: true,
      data: ticket,
      message: `Phiếu yêu cầu hỗ trợ #${ticket.ticketCode} đã được khởi tạo. Đội ngũ kỹ thuật sẽ phản hồi trong 24h.`,
    });
  } catch (err: unknown) {
    console.error('Create ticket error:', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Không thể tạo phiếu hỗ trợ' }, { status: 500 });
  }
}
