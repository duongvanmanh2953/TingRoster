import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { z } from 'zod';

const ServiceSchema = z.object({
  name: z.string().min(1, 'Tên dịch vụ không được để trống'),
  code: z.string().min(1, 'Mã dịch vụ không được để trống'),
  category: z.string().default('GENERAL'),
  billingType: z.string().default('MONTHLY'),
  unit: z.string().default('tháng'),
  unitPrice: z.number().int().min(0, 'Đơn giá phải là số nguyên không âm'),
  description: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  metadata: z.string().optional().nullable(),
});

// GET /api/groups/[id]/services
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const group = await prisma.group.findFirst({
      where: { id: params.id, userId },
      select: { id: true, name: true, groupType: true },
    });

    if (!group) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy không gian' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const isActiveParam = searchParams.get('isActive');

    const where: any = { groupId: params.id };
    if (category) {
      where.category = category;
    }
    if (isActiveParam !== null && isActiveParam !== undefined) {
      where.isActive = isActiveParam === 'true';
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({
      success: true,
      data: services,
      group,
    });
  } catch (error: any) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ success: false, error: 'Lỗi máy chủ khi lấy danh mục dịch vụ' }, { status: 500 });
  }
}

// POST /api/groups/[id]/services
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const group = await prisma.group.findFirst({
      where: { id: params.id, userId },
    });
    if (!group) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy không gian' }, { status: 404 });
    }

    const body = await req.json();
    const parsed = ServiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: parsed.error.issues[0]?.message || 'Dữ liệu dịch vụ không hợp lệ',
      }, { status: 400 });
    }

    // Check unique code in group
    const existing = await prisma.service.findUnique({
      where: {
        groupId_code: {
          groupId: params.id,
          code: parsed.data.code.trim().toUpperCase(),
        },
      },
    });

    if (existing) {
      return NextResponse.json({
        success: false,
        error: `Mã dịch vụ "${parsed.data.code}" đã tồn tại trong không gian này`,
      }, { status: 409 });
    }

    const newService = await prisma.service.create({
      data: {
        groupId: params.id,
        name: parsed.data.name.trim(),
        code: parsed.data.code.trim().toUpperCase(),
        category: parsed.data.category,
        billingType: parsed.data.billingType,
        unit: parsed.data.unit.trim(),
        unitPrice: parsed.data.unitPrice,
        description: parsed.data.description?.trim() || null,
        isActive: parsed.data.isActive,
        metadata: parsed.data.metadata || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: newService,
      message: 'Tạo dịch vụ thành công',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating service:', error);
    return NextResponse.json({ success: false, error: 'Lỗi khi tạo dịch vụ' }, { status: 500 });
  }
}

// PATCH /api/groups/[id]/services
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const group = await prisma.group.findFirst({
      where: { id: params.id, userId },
    });
    if (!group) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy không gian' }, { status: 404 });
    }

    const body = await req.json();
    const { id, name, unitPrice, unit, description, isActive, metadata } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu mã ID dịch vụ cần cập nhật' }, { status: 400 });
    }

    // Verify service belongs to group
    const existingService = await prisma.service.findFirst({
      where: { id, groupId: params.id },
    });
    if (!existingService) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy dịch vụ trong không gian này' }, { status: 404 });
    }

    const updated = await prisma.service.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(unitPrice !== undefined ? { unitPrice: Number(unitPrice) } : {}),
        ...(unit ? { unit: unit.trim() } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
        ...(metadata !== undefined ? { metadata: metadata } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Cập nhật dịch vụ thành công',
    });
  } catch (error: any) {
    console.error('Error updating service:', error);
    return NextResponse.json({ success: false, error: 'Lỗi khi cập nhật dịch vụ' }, { status: 500 });
  }
}
