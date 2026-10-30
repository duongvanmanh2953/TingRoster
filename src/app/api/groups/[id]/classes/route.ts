import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { z } from 'zod';

const ClassCreateSchema = z.object({
  className: z.string().min(1, 'Tên lớp học không được để trống'),
  subject: z.string().min(1, 'Môn học không được để trống'),
  courseType: z.string().default('MONTHLY'),
  teacherName: z.string().optional().nullable(),
  room: z.string().optional().nullable(),
  schedule: z.string().optional().nullable(),
  maxCapacity: z.number().int().min(1).default(30),
  feePerPeriod: z.number().int().min(0).default(0),
});

// GET /api/groups/[id]/classes
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

    const classes = await prisma.educationalClass.findMany({
      where: { groupId: params.id },
      orderBy: { className: 'asc' },
    });

    const membersCount = await prisma.member.count({
      where: { groupId: params.id, status: 'ACTIVE' },
    });

    return NextResponse.json({
      success: true,
      data: classes,
      totalStudents: membersCount,
      group,
    });
  } catch (error: any) {
    console.error('Error fetching classes:', error);
    return NextResponse.json({ success: false, error: 'Lỗi khi tải danh sách lớp học' }, { status: 500 });
  }
}

// POST /api/groups/[id]/classes
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
    const parsed = ClassCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: parsed.error.issues[0]?.message || 'Dữ liệu lớp học không hợp lệ',
      }, { status: 400 });
    }

    const newClass = await prisma.educationalClass.create({
      data: {
        groupId: params.id,
        className: parsed.data.className.trim(),
        subject: parsed.data.subject.trim(),
        courseType: parsed.data.courseType,
        teacherName: parsed.data.teacherName?.trim() || null,
        room: parsed.data.room?.trim() || null,
        schedule: parsed.data.schedule?.trim() || null,
        maxCapacity: parsed.data.maxCapacity,
        feePerPeriod: parsed.data.feePerPeriod,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({
      success: true,
      data: newClass,
      message: `Tạo lớp ${newClass.className} thành công`,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating class:', error);
    return NextResponse.json({ success: false, error: 'Lỗi khi tạo lớp học' }, { status: 500 });
  }
}
