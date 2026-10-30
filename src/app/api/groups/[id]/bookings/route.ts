import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { z } from 'zod';

const BookingCreateSchema = z.object({
  customerName: z.string().min(1, 'Tên khách hàng không được để trống'),
  customerPhone: z.string().optional().nullable(),
  memberId: z.string().optional().nullable(),
  courtName: z.string().min(1, 'Tên sân không được để trống'),
  courtType: z.string().default('STANDARD'),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày đặt có định dạng YYYY-MM-DD'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Giờ bắt đầu có định dạng HH:mm (ví dụ 18:00)'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Giờ kết thúc có định dạng HH:mm (ví dụ 20:00)'),
  courtPrice: z.number().int().min(0, 'Giá sân phải là số nguyên không âm'),
  surchargeFee: z.number().int().min(0).default(0),
});

// GET /api/groups/[id]/bookings
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
    const dateStr = searchParams.get('date') || new Date().toISOString().slice(0, 10);
    const dateObj = new Date(dateStr);

    const bookings = await prisma.sportsBooking.findMany({
      where: {
        groupId: params.id,
        bookingDate: dateObj,
      },
      include: {
        member: { select: { id: true, name: true, phone: true } },
      },
      orderBy: [{ startTime: 'asc' }],
    });

    const members = await prisma.member.findMany({
      where: { groupId: params.id, status: 'ACTIVE' },
      select: { id: true, name: true, phone: true },
    });

    return NextResponse.json({
      success: true,
      data: bookings,
      date: dateStr,
      members,
      group,
    });
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ success: false, error: 'Lỗi khi tải lịch đặt sân' }, { status: 500 });
  }
}

// POST /api/groups/[id]/bookings
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
    const parsed = BookingCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: parsed.error.issues[0]?.message || 'Dữ liệu đặt sân không hợp lệ',
      }, { status: 400 });
    }

    const {
      customerName,
      customerPhone,
      memberId,
      courtName,
      courtType,
      bookingDate,
      startTime,
      endTime,
      courtPrice,
      surchargeFee,
    } = parsed.data;

    const totalAmount = courtPrice + surchargeFee;

    const booking = await prisma.sportsBooking.create({
      data: {
        groupId: params.id,
        memberId: memberId || null,
        customerName: customerName.trim(),
        customerPhone: customerPhone?.trim() || null,
        courtName: courtName.trim(),
        courtType,
        bookingDate: new Date(bookingDate),
        startTime,
        endTime,
        courtPrice,
        surchargeFee,
        overtimeFee: 0,
        totalAmount,
        paidAmount: 0,
        isPaid: false,
        status: 'RESERVED',
      },
    });

    return NextResponse.json({
      success: true,
      data: booking,
      message: `Đặt sân ${courtName} thành công cho khách hàng ${customerName}`,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ success: false, error: 'Lỗi khi tạo lịch đặt sân' }, { status: 500 });
  }
}

// PATCH /api/groups/[id]/bookings (Check-in, Check-out, Overtime calculation, Payment)
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
    const { bookingId, action, surchargeFee, note } = body;

    if (!bookingId) {
      return NextResponse.json({ success: false, error: 'Thiếu mã bookingId' }, { status: 400 });
    }

    const booking = await prisma.sportsBooking.findUnique({
      where: { id: bookingId },
    });
    if (!booking || booking.groupId !== params.id) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy lượt đặt sân' }, { status: 404 });
    }

    const now = new Date();

    if (action === 'CHECK_IN') {
      const updated = await prisma.sportsBooking.update({
        where: { id: bookingId },
        data: {
          status: 'CHECKED_IN',
          actualCheckIn: now,
        },
      });
      return NextResponse.json({
        success: true,
        data: updated,
        message: `Đã check-in cho sân ${booking.courtName} lúc ${now.toLocaleTimeString('vi-VN')}`,
      });
    }

    if (action === 'CHECK_OUT') {
      // Calculate overtime if applicable
      const bookingDateStr = booking.bookingDate.toISOString().slice(0, 10);
      const [endH, endM] = booking.endTime.split(':').map(Number);
      const scheduledEnd = new Date(`${bookingDateStr}T${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`);

      let overtimeMinutes = 0;
      let overtimeFee = 0;

      if (now.getTime() > scheduledEnd.getTime()) {
        const diffMs = now.getTime() - scheduledEnd.getTime();
        overtimeMinutes = Math.floor(diffMs / 60000);

        // If over 10 minutes grace period, calculate overtime fee based on court hourly rate
        if (overtimeMinutes > 10) {
          const [startH, startM] = booking.startTime.split(':').map(Number);
          const durationMinutes = Math.max(30, (endH * 60 + endM) - (startH * 60 + startM));
          const hourlyRate = (booking.courtPrice / durationMinutes) * 60;
          overtimeFee = Math.round((overtimeMinutes / 60) * hourlyRate);
        }
      }

      const additionalSurcharge = Number(surchargeFee) || 0;
      const totalSurcharge = booking.surchargeFee + additionalSurcharge;
      const totalAmount = booking.courtPrice + overtimeFee + totalSurcharge;

      const updated = await prisma.sportsBooking.update({
        where: { id: bookingId },
        data: {
          status: 'CHECKED_OUT',
          actualCheckOut: now,
          overtimeFee,
          surchargeFee: totalSurcharge,
          totalAmount,
        },
      });

      return NextResponse.json({
        success: true,
        data: updated,
        message: `Đã check-out sân ${booking.courtName}. Quá giờ: ${overtimeMinutes} phút (Phụ phí: ${overtimeFee.toLocaleString('vi-VN')} đ). Tổng tiền: ${totalAmount.toLocaleString('vi-VN')} đ`,
      });
    }

    if (action === 'MARK_PAID') {
      const updated = await prisma.sportsBooking.update({
        where: { id: bookingId },
        data: {
          isPaid: true,
          paidAmount: booking.totalAmount,
        },
      });
      return NextResponse.json({
        success: true,
        data: updated,
        message: `Đã xác nhận thanh toán đủ ${booking.totalAmount.toLocaleString('vi-VN')} đ`,
      });
    }

    if (action === 'CANCEL') {
      const updated = await prisma.sportsBooking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' },
      });
      return NextResponse.json({
        success: true,
        data: updated,
        message: 'Đã hủy lượt đặt sân',
      });
    }

    return NextResponse.json({ success: false, error: 'Hành động không hợp lệ' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ success: false, error: 'Lỗi khi cập nhật đặt sân' }, { status: 500 });
  }
}
