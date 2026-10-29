import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { AttendanceStatus } from '@prisma/client';
import { generateVietQRUrl } from '@/lib/providers/vietqr';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const { groupId } = params;
    const body = await req.json().catch(() => ({}));
    const { code, memberId } = body;

    const queryTarget = (code || memberId || '').toString().trim();

    if (!queryTarget) {
      return NextResponse.json(
        {
          success: false,
          errorCode: 'MISSING_CODE',
          error: 'Vui lòng đưa mã QR thành viên vào vùng quét hoặc nhập mã định danh.',
        },
        { status: 400 }
      );
    }

    // 1. Verify space/group exists
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            bankId: true,
            bankAccountNo: true,
            bankAccountName: true,
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json(
        {
          success: false,
          errorCode: 'SPACE_NOT_FOUND',
          error: 'Không tìm thấy không gian hoặc địa điểm này trên hệ thống.',
        },
        { status: 404 }
      );
    }

    // 2. Identify the member in this group
    // Accepts format: TR-MEMBER-{id}, raw cuid id, phone number, or exact full name
    const cleanId = queryTarget.replace(/^TR-MEMBER-/, '');

    const member = await prisma.member.findFirst({
      where: {
        groupId,
        OR: [
          { id: cleanId },
          { id: queryTarget },
          { phone: queryTarget },
          { name: { equals: queryTarget, mode: 'insensitive' } },
        ],
      },
    });

    if (!member) {
      // Check if this member belongs to another group/space
      const belongsElsewhere = await prisma.member.findFirst({
        where: {
          OR: [
            { id: cleanId },
            { id: queryTarget },
            { phone: queryTarget },
          ],
        },
        include: {
          group: {
            select: { name: true },
          },
        },
      });

      if (belongsElsewhere) {
        return NextResponse.json(
          {
            success: false,
            errorCode: 'SPACE_MISMATCH',
            error: `Mã thành viên này thuộc không gian "${belongsElsewhere.group.name}". Không thể check-in tại "${group.name}".`,
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          errorCode: 'MEMBER_NOT_FOUND',
          error: 'Mã QR không hợp lệ hoặc thành viên không thuộc danh sách địa điểm này.',
        },
        { status: 404 }
      );
    }

    // 3. Verify member eligibility
    if (member.status !== 'ACTIVE') {
      return NextResponse.json(
        {
          success: false,
          errorCode: 'INELIGIBLE_STATUS',
          error: `Thành viên "${member.name}" đang ở trạng thái "${member.status}", chưa đủ điều kiện check-in. Vui lòng liên hệ nhân viên quản lý.`,
          memberName: member.name,
        },
        { status: 403 }
      );
    }

    // 4. Session & Schedule Matching for today
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const hour = now.getHours();
    let sessionName = 'Ca sinh hoạt tiêu chuẩn';
    let timeWindow = '06:00 - 22:00';

    if (group.groupType === 'SPORTS_CLUB') {
      if (hour < 12) {
        sessionName = 'Ca tập Buổi sáng';
        timeWindow = '06:00 - 11:30';
      } else if (hour < 17) {
        sessionName = 'Ca tập Buổi chiều';
        timeWindow = '13:30 - 17:00';
      } else {
        sessionName = 'Ca tập Buổi tối';
        timeWindow = '17:30 - 22:00';
      }
    } else if (group.groupType === 'CLASS') {
      if (hour < 12) {
        sessionName = 'Ca học Buổi sáng';
        timeWindow = '07:30 - 11:30';
      } else if (hour < 18) {
        sessionName = 'Ca học Buổi chiều';
        timeWindow = '13:30 - 17:30';
      } else {
        sessionName = 'Ca học Buổi tối';
        timeWindow = '18:00 - 21:30';
      }
    } else if (group.groupType === 'RENTAL') {
      sessionName = 'Check-in Khu căn hộ / Phòng trọ';
      timeWindow = '24/7';
    }

    // 5. Check if attendance already recorded today
    const existingRecord = await prisma.attendance.findFirst({
      where: {
        groupId,
        memberId: member.id,
        date: today,
        isPresent: true,
      },
    });

    // 6. Check for financial dues/unpaid invoices
    const unpaidInvoice = await prisma.invoice.findFirst({
      where: {
        groupId,
        memberId: member.id,
        status: { in: ['UNPAID', 'PARTIAL'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    const remainingDue = unpaidInvoice ? Math.max(0, unpaidInvoice.amountDue - unpaidInvoice.amountPaid) : 0;
    const hasDue = Boolean(unpaidInvoice && remainingDue > 0);

    // 7. Space Debt Policy Configuration
    // ALLOW_ALL_NOTIFY_DUE (default) | REQUIRE_PAYMENT_BLOCK | CHECKIN_ONLY_NO_PAY
    let debtPolicy: 'ALLOW_ALL_NOTIFY_DUE' | 'REQUIRE_PAYMENT_BLOCK' | 'CHECKIN_ONLY_NO_PAY' = 'ALLOW_ALL_NOTIFY_DUE';
    if (group.description?.includes('[POLICY:REQUIRE_PAYMENT_BLOCK]')) {
      debtPolicy = 'REQUIRE_PAYMENT_BLOCK';
    } else if (group.description?.includes('[POLICY:CHECKIN_ONLY_NO_PAY]')) {
      debtPolicy = 'CHECKIN_ONLY_NO_PAY';
    }

    const isBlocked = debtPolicy === 'REQUIRE_PAYMENT_BLOCK' && hasDue;

    // 8. If blocked, do not record attendance until payment is completed
    let attendance = existingRecord;
    if (!isBlocked) {
      attendance = await prisma.attendance.upsert({
        where: {
          groupId_memberId_date: {
            groupId,
            memberId: member.id,
            date: today,
          },
        },
        update: {
          isPresent: true,
          status: AttendanceStatus.PRESENT,
          note: existingRecord
            ? `Kiosk quét lại lúc ${now.toLocaleTimeString('vi-VN')}`
            : `Kiosk check-in lúc ${now.toLocaleTimeString('vi-VN')}`,
        },
        create: {
          groupId,
          memberId: member.id,
          date: today,
          isPresent: true,
          status: AttendanceStatus.PRESENT,
          note: `Kiosk check-in lúc ${now.toLocaleTimeString('vi-VN')}`,
        },
      });
    }

    const timeFormatted = now.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    // Generate real VietQR URL if there is an outstanding balance
    let vietQrUrl: string | null = null;
    if (hasDue && unpaidInvoice) {
      vietQrUrl = generateVietQRUrl({
        bankId: group.user.bankId,
        accountNo: group.user.bankAccountNo,
        accountName: group.user.bankAccountName,
        amount: remainingDue,
        paymentCode: unpaidInvoice.paymentCode,
      });
    }

    return NextResponse.json({
      success: true,
      alreadyCheckedIn: Boolean(existingRecord),
      isBlocked,
      message: isBlocked
        ? `Yêu cầu hoàn tất học phí/phí sân trước khi tham gia!`
        : existingRecord
        ? `Đã điểm danh trước đó trong ngày`
        : `Điểm danh thành công!`,
      data: {
        member: {
          id: member.id,
          name: member.name,
          phone: member.phone,
          status: member.status,
        },
        session: {
          title: sessionName,
          timeWindow,
          spaceName: group.name,
          spaceCode: group.code,
        },
        attendance: attendance
          ? {
              id: attendance.id,
              time: timeFormatted,
              date: today.toISOString().split('T')[0],
              status: attendance.status,
              isPresent: true,
            }
          : null,
        group: {
          id: group.id,
          name: group.name,
          logoUrl: group.logoUrl,
          themeColor: group.themeColor,
          supportContact: group.user?.email || null,
        },
        feeStatus: hasDue && unpaidInvoice
          ? {
              hasDue: true,
              invoiceId: unpaidInvoice.id,
              invoiceTitle: unpaidInvoice.title,
              amountDue: unpaidInvoice.amountDue,
              amountPaid: unpaidInvoice.amountPaid,
              remainingDue,
              paymentCode: unpaidInvoice.paymentCode,
              vietQrUrl,
              bankId: group.user.bankId,
              bankAccountNo: group.user.bankAccountNo,
              bankAccountName: group.user.bankAccountName,
              policy: debtPolicy,
              isBlocked,
            }
          : {
              hasDue: false,
              policy: debtPolicy,
              isBlocked: false,
            },
      },
    });
  } catch (err: unknown) {
    console.error('Kiosk check-in verification error:', err);
    return NextResponse.json(
      {
        success: false,
        errorCode: 'SERVER_ERROR',
        error: 'Hệ thống máy chủ bận hoặc gặp sự cố xử lý. Vui lòng thử lại.',
      },
      { status: 500 }
    );
  }
}
