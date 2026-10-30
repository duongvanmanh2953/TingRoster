import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { z } from 'zod';

const RentalContractSchema = z.object({
  roomNumber: z.string().min(1, 'Số phòng không được để trống'),
  memberId: z.string().min(1, 'Người thuê không được để trống'),
  contractCode: z.string().min(1, 'Mã hợp đồng không được để trống'),
  monthlyRent: z.number().int().min(0, 'Tiền thuê phải là số nguyên không âm'),
  depositAmount: z.number().int().min(0).default(0),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày bắt đầu có định dạng YYYY-MM-DD'),
  endDate: z.string().optional().nullable(),
  billingDayOfMonth: z.number().int().min(1).max(31).default(5),
  notes: z.string().optional().nullable(),
});

// GET /api/groups/[id]/rentals
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
      select: { id: true, name: true, defaultFee: true },
    });
    if (!group) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy không gian' }, { status: 404 });
    }

    const contracts = await prisma.rentalContract.findMany({
      where: { groupId: params.id },
      include: {
        member: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { roomNumber: 'asc' },
    });

    const members = await prisma.member.findMany({
      where: { groupId: params.id, status: 'ACTIVE' },
      select: { id: true, name: true, phone: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: contracts,
      members,
      group,
    });
  } catch (error: any) {
    console.error('Error fetching rentals:', error);
    return NextResponse.json({ success: false, error: 'Lỗi khi tải danh sách phòng & hợp đồng' }, { status: 500 });
  }
}

// POST /api/groups/[id]/rentals
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
    const parsed = RentalContractSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: parsed.error.issues[0]?.message || 'Dữ liệu hợp đồng không hợp lệ',
      }, { status: 400 });
    }

    const existingCode = await prisma.rentalContract.findUnique({
      where: { contractCode: parsed.data.contractCode.trim().toUpperCase() },
    });
    if (existingCode) {
      return NextResponse.json({
        success: false,
        error: `Mã hợp đồng "${parsed.data.contractCode}" đã tồn tại trên hệ thống`,
      }, { status: 409 });
    }

    const contract = await prisma.rentalContract.create({
      data: {
        groupId: params.id,
        memberId: parsed.data.memberId,
        roomNumber: parsed.data.roomNumber.trim().toUpperCase(),
        contractCode: parsed.data.contractCode.trim().toUpperCase(),
        monthlyRent: parsed.data.monthlyRent,
        depositAmount: parsed.data.depositAmount,
        startDate: new Date(parsed.data.startDate),
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
        billingDayOfMonth: parsed.data.billingDayOfMonth,
        notes: parsed.data.notes?.trim() || null,
        status: 'ACTIVE',
      },
      include: {
        member: { select: { id: true, name: true, phone: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: contract,
      message: `Tạo hợp đồng phòng ${contract.roomNumber} thành công`,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating contract:', error);
    return NextResponse.json({ success: false, error: 'Lỗi khi tạo hợp đồng thuê' }, { status: 500 });
  }
}
