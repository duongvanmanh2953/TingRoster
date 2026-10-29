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
      select: { id: true, role: true },
    });

    const { searchParams } = req.nextUrl;
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const query = searchParams.get('query');

    const whereClause: Record<string, unknown> = {};
    if (user?.role !== 'ADMIN') {
      whereClause.userId = userId;
    }
    if (status && status !== 'ALL') {
      whereClause.status = status;
    }
    if (category && category !== 'ALL') {
      whereClause.category = category;
    }
    if (priority && priority !== 'ALL') {
      whereClause.priority = priority;
    }
    if (query) {
      whereClause.OR = [
        { ticketCode: { contains: query, mode: 'insensitive' } },
        { subject: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    const tickets = await prisma.supportTicket.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            bankId: true,
            bankAccountNo: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, data: tickets });
  } catch (err: unknown) {
    console.error('Fetch support tickets error:', err);
    return NextResponse.json({ success: false, error: 'Không thể tải danh sách phiếu hỗ trợ' }, { status: 500 });
  }
}

const CreateTicketSchema = z.object({
  category: z.enum([
    'BUG',
    'FEATURE',
    'BILLING',
    'GENERAL',
    'PAYMENT_DISPUTE',
    'UNMATCHED_TX',
    'REFUND_REQUEST',
    'ACCOUNT_ACCESS',
  ]),
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
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'SUPPORT_TICKET_CREATED',
        entityType: 'SUPPORT_TICKET',
        entityId: ticket.id,
        details: JSON.stringify({
          ticketCode: ticket.ticketCode,
          category: ticket.category,
          priority: ticket.priority,
        }),
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      },
    });

    return NextResponse.json({
      success: true,
      data: ticket,
      message: `Phiếu yêu cầu hỗ trợ #${ticket.ticketCode} đã được khởi tạo. Đội ngũ kỹ thuật TingRoster sẽ phản hồi sớm nhất.`,
    });
  } catch (err: unknown) {
    console.error('Create ticket error:', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Không thể tạo phiếu hỗ trợ' }, { status: 500 });
  }
}

const UpdateTicketSchema = z.object({
  ticketId: z.string().min(1, 'Thiếu ticketId'),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  adminNote: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const adminUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (adminUser?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Chỉ Platform Admin mới có quyền cập nhật trạng thái phiếu hỗ trợ' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = UpdateTicketSchema.parse(body);

    const updateData: Record<string, unknown> = {};
    if (parsed.status) updateData.status = parsed.status;
    if (parsed.priority) updateData.priority = parsed.priority;
    if (parsed.adminNote !== undefined) updateData.adminNote = parsed.adminNote;

    const updatedTicket = await prisma.supportTicket.update({
      where: { id: parsed.ticketId },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // Record admin audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'SUPPORT_TICKET_UPDATED',
        entityType: 'SUPPORT_TICKET',
        entityId: updatedTicket.id,
        details: JSON.stringify({
          ticketCode: updatedTicket.ticketCode,
          newStatus: parsed.status,
          newPriority: parsed.priority,
          hasAdminNote: Boolean(parsed.adminNote),
        }),
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedTicket,
      message: `Đã cập nhật phiếu #${updatedTicket.ticketCode} thành công.`,
    });
  } catch (err: unknown) {
    console.error('Update ticket error:', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Không thể cập nhật phiếu hỗ trợ' }, { status: 500 });
  }
}
