import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { z } from 'zod';
import { generateUniquePaymentCode } from '@/lib/reconciliation/payment-code';

const MeterSchema = z.object({
  roomCode: z.string().min(1, 'Mã phòng không được để trống'),
  memberId: z.string().optional().nullable(),
  billingMonth: z.string().regex(/^\d{4}-\d{2}$/, 'Tháng tính phí phải có định dạng YYYY-MM (ví dụ 2026-10)'),
  prevElectric: z.number().min(0),
  currElectric: z.number().min(0),
  electricRate: z.number().int().min(0).default(3500),
  prevWater: z.number().min(0),
  currWater: z.number().min(0),
  waterRate: z.number().int().min(0).default(25000),
  note: z.string().optional().nullable(),
});

// GET /api/groups/[id]/meters
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

    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7);

    const readings = await prisma.meterReading.findMany({
      where: {
        groupId: params.id,
        billingMonth: month,
      },
      include: {
        member: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { roomCode: 'asc' },
    });

    // Also get members for room mapping
    const members = await prisma.member.findMany({
      where: { groupId: params.id, status: 'ACTIVE' },
      select: { id: true, name: true, phone: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: readings,
      month,
      members,
      group,
    });
  } catch (error: any) {
    console.error('Error fetching meters:', error);
    return NextResponse.json({ success: false, error: 'Lỗi khi tải danh sách chỉ số điện nước' }, { status: 500 });
  }
}

// POST /api/groups/[id]/meters (Save / update meter reading)
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

    // Check if this is a batch invoice generation action
    if (body.action === 'GENERATE_INVOICES') {
      const { month } = body;
      if (!month) {
        return NextResponse.json({ success: false, error: 'Thiếu tháng cần tạo hóa đơn' }, { status: 400 });
      }

      const pendingReadings = await prisma.meterReading.findMany({
        where: {
          groupId: params.id,
          billingMonth: month,
          status: 'PENDING',
          memberId: { not: null },
        },
        include: {
          member: true,
        },
      });

      if (pendingReadings.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Không có phòng nào có chỉ số chờ phát hành hoặc chưa gán người thuê',
        }, { status: 400 });
      }

      let generatedCount = 0;
      const skippedRooms: string[] = [];

      for (const reading of pendingReadings) {
        if (!reading.memberId) continue;

        // Check if invoice already exists for this room/member for this month to prevent duplicates
        const existingInvoice = await prisma.invoice.findFirst({
          where: {
            groupId: params.id,
            memberId: reading.memberId,
            title: { contains: `${reading.roomCode} - Tháng ${month}` },
          },
        });

        if (existingInvoice) {
          skippedRooms.push(reading.roomCode);
          continue;
        }

        const roomRent = group.defaultFee || 0;
        const totalAmount = roomRent + reading.electricTotal + reading.waterTotal;
        const paymentCode = await generateUniquePaymentCode();

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 5); // 5 days due

        await prisma.$transaction(async (tx: any) => {
          const invoice = await tx.invoice.create({
            data: {
              groupId: params.id,
              userId,
              memberId: reading.memberId!,
              title: `Tiền phòng ${reading.roomCode} - Tháng ${month}`,
              amountDue: totalAmount,
              amountPaid: 0,
              paymentCode,
              dueDate,
              status: 'UNPAID',
              metadata: JSON.stringify({
                roomCode: reading.roomCode,
                billingMonth: month,
                roomRent,
                electricUsage: reading.electricUsage,
                electricTotal: reading.electricTotal,
                waterUsage: reading.waterUsage,
                waterTotal: reading.waterTotal,
              }),
            },
          });

          // Create Line Items snapshot
          if (roomRent > 0) {
            await tx.invoiceLineItem.create({
              data: {
                invoiceId: invoice.id,
                title: `Tiền thuê phòng ${reading.roomCode}`,
                quantity: 1,
                unit: 'tháng',
                unitPrice: roomRent,
                amount: roomRent,
              },
            });
          }

          if (reading.electricTotal > 0) {
            await tx.invoiceLineItem.create({
              data: {
                invoiceId: invoice.id,
                title: `Tiền điện (${reading.currElectric} - ${reading.prevElectric} = ${reading.electricUsage} kWh)`,
                quantity: reading.electricUsage,
                unit: 'kWh',
                unitPrice: reading.electricRate,
                amount: reading.electricTotal,
              },
            });
          }

          if (reading.waterTotal > 0) {
            await tx.invoiceLineItem.create({
              data: {
                invoiceId: invoice.id,
                title: `Tiền nước (${reading.currWater} - ${reading.prevWater} = ${reading.waterUsage} m³)`,
                quantity: reading.waterUsage,
                unit: 'm³',
                unitPrice: reading.waterRate,
                amount: reading.waterTotal,
              },
            });
          }

          // Mark meter reading as INVOICED
          await tx.meterReading.update({
            where: { id: reading.id },
            data: {
              status: 'INVOICED',
              invoiceId: invoice.id,
            },
          });

          generatedCount++;
        });
      }

      return NextResponse.json({
        success: true,
        message: `Đã phát hành ${generatedCount} hóa đơn cho kỳ ${month}. ${
          skippedRooms.length > 0 ? `Bỏ qua ${skippedRooms.join(', ')} do đã có hóa đơn.` : ''
        }`,
        data: { generatedCount, skippedRooms },
      });
    }

    // Normal Meter Reading Upsert
    const parsed = MeterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: parsed.error.issues[0]?.message || 'Dữ liệu chỉ số không hợp lệ',
      }, { status: 400 });
    }

    const {
      roomCode,
      memberId,
      billingMonth,
      prevElectric,
      currElectric,
      electricRate,
      prevWater,
      currWater,
      waterRate,
      note,
    } = parsed.data;

    const electricUsage = Math.max(0, currElectric - prevElectric);
    const electricTotal = Math.round(electricUsage * electricRate);

    const waterUsage = Math.max(0, currWater - prevWater);
    const waterTotal = Math.round(waterUsage * waterRate);

    const saved = await prisma.meterReading.upsert({
      where: {
        groupId_roomCode_billingMonth: {
          groupId: params.id,
          roomCode: roomCode.trim().toUpperCase(),
          billingMonth,
        },
      },
      create: {
        groupId: params.id,
        roomCode: roomCode.trim().toUpperCase(),
        memberId: memberId || null,
        billingMonth,
        prevElectric,
        currElectric,
        electricUsage,
        electricRate,
        electricTotal,
        prevWater,
        currWater,
        waterUsage,
        waterRate,
        waterTotal,
        note: note || null,
        status: 'PENDING',
      },
      update: {
        memberId: memberId || null,
        prevElectric,
        currElectric,
        electricUsage,
        electricRate,
        electricTotal,
        prevWater,
        currWater,
        waterUsage,
        waterRate,
        waterTotal,
        note: note || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: saved,
      message: `Đã lưu chỉ số phòng ${roomCode.trim().toUpperCase()} (${electricUsage} kWh điện, ${waterUsage} m³ nước)`,
    });
  } catch (error: any) {
    console.error('Error saving meter reading:', error);
    return NextResponse.json({ success: false, error: 'Lỗi khi lưu chỉ số điện nước' }, { status: 500 });
  }
}
