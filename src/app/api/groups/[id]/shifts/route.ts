import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const CreateShiftSchema = z.object({
  name: z.string().min(1, 'Tên ca làm không được để trống'),
  shiftDate: z.string(), // YYYY-MM-DD
  startTime: z.string(), // "08:00"
  endTime: z.string(), // "12:00"
  location: z.string().optional(),
  maxSlots: z.number().int().positive().default(2),
  description: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = params.id;

    const shifts = await prisma.workShift.findMany({
      where: { groupId },
      orderBy: [{ shiftDate: 'asc' }, { startTime: 'asc' }],
      include: {
        assignments: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: shifts,
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
    const parsed = CreateShiftSchema.parse(body);

    const shift = await prisma.workShift.create({
      data: {
        groupId,
        name: parsed.name,
        shiftDate: new Date(parsed.shiftDate),
        startTime: parsed.startTime,
        endTime: parsed.endTime,
        location: parsed.location,
        maxSlots: parsed.maxSlots,
        description: parsed.description,
      },
    });

    return NextResponse.json({
      success: true,
      data: shift,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi máy chủ';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
