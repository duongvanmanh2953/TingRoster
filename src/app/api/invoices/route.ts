import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { InvoiceStatus } from '@prisma/client';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  const groupId = req.nextUrl.searchParams.get('groupId');
  const status = req.nextUrl.searchParams.get('status') as InvoiceStatus | null;
  const search = req.nextUrl.searchParams.get('search');

  const whereClause: Record<string, unknown> = { userId };
  if (groupId) whereClause.groupId = groupId;
  if (status) whereClause.status = status;
  if (search) {
    whereClause.OR = [
      { paymentCode: { contains: search, mode: 'insensitive' } },
      { title: { contains: search, mode: 'insensitive' } },
      { member: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const invoices = await prisma.invoice.findMany({
    where: whereClause,
    include: {
      member: { select: { id: true, name: true, phone: true } },
      group: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return NextResponse.json({ success: true, data: invoices });
}

const LineItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Tên mục không được để trống'),
  qty: z.number().positive('Số lượng phải lớn hơn 0'),
  unit: z.string().optional(),
  unitPrice: z.number().int(),
  discount: z.number().int().optional().default(0),
  total: z.number().int(),
  note: z.string().optional(),
});

const CreateSingleInvoiceSchema = z.object({
  groupId: z.string().min(1, 'Vui lòng chọn nhóm / cơ sở'),
  memberId: z.string().min(1, 'Vui lòng chọn học viên / khách thuê'),
  title: z.string().min(2, 'Tiêu đề khoản thu không được để trống'),
  amountDue: z.number().int().positive('Số tiền phải lớn hơn 0'),
  dueDate: z.string().optional(),
  lineItems: z.array(LineItemSchema).optional(),
  partialPaymentAllowed: z.boolean().optional(),
  minPartialAmount: z.number().int().optional(),
  documentType: z.enum(['INTERNAL_STATEMENT', 'RECEIPT', 'ESTIMATE']).optional(),
});

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = CreateSingleInvoiceSchema.parse(body);

    // Verify ownership
    const group = await prisma.group.findFirst({
      where: { id: parsed.groupId, userId },
    });
    if (!group) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy nhóm / cơ sở' }, { status: 404 });
    }

    const member = await prisma.member.findFirst({
      where: { id: parsed.memberId, groupId: parsed.groupId },
    });
    if (!member) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy thành viên trong nhóm' }, { status: 404 });
    }

    const { generateUniquePaymentCode } = await import('@/lib/reconciliation/payment-code');
    const paymentCode = await generateUniquePaymentCode();
    const dueDateTime = parsed.dueDate ? new Date(parsed.dueDate) : new Date(Date.now() + 7 * 86400000);

    const metadataObj: Record<string, unknown> = {};
    if (parsed.lineItems && parsed.lineItems.length > 0) {
      metadataObj.lineItems = parsed.lineItems;
    }
    if (parsed.partialPaymentAllowed !== undefined) {
      metadataObj.partialPaymentAllowed = parsed.partialPaymentAllowed;
      metadataObj.minPartialAmount = parsed.minPartialAmount || 0;
    }
    metadataObj.documentType = parsed.documentType || 'INTERNAL_STATEMENT';

    const invoice = await prisma.invoice.create({
      data: {
        userId,
        groupId: parsed.groupId,
        memberId: parsed.memberId,
        title: parsed.title,
        amountDue: parsed.amountDue,
        amountPaid: 0,
        paymentCode,
        dueDate: dueDateTime,
        status: 'UNPAID',
        metadata: Object.keys(metadataObj).length > 0 ? JSON.stringify(metadataObj) : null,
      },
      include: {
        member: { select: { id: true, name: true, phone: true } },
        group: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({ success: true, data: invoice });
  } catch (err: any) {
    console.error('Create single invoice error:', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0]?.message || 'Dữ liệu không hợp lệ' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Không thể tạo hóa đơn' }, { status: 500 });
  }
}
