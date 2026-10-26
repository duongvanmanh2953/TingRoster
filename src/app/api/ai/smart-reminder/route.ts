import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { formatVND, formatDateVN } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const { invoiceId } = await req.json();

    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, userId },
      include: {
        member: true,
        group: true,
        user: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy hóa đơn' }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    const paymentLink = `${appUrl}/p/${invoice.group.slug}?token=${invoice.publicToken}`;
    const remaining = formatVND(invoice.amountDue - invoice.amountPaid);
    const dueDateStr = invoice.dueDate ? formatDateVN(invoice.dueDate) : 'sớm nhất';

    const gentle = `Dạ em chào Quý phụ huynh em ${invoice.member.name} ạ! Lớp ${invoice.group.name} vừa tổng kết học phí đợt này. Số tiền cần đóng là ${remaining}. Quý phụ huynh có thể mở link này để quét mã QR chuyển khoản nhanh tiện lợi ạ: ${paymentLink} (Nội dung: ${invoice.paymentCode}). Em cảm ơn Quý phụ huynh rất nhiều ạ!`;

    const neutral = `Kính gửi Quý phụ huynh học viên ${invoice.member.name},\nThông báo học phí lớp ${invoice.group.name}:\n• Khoản thu: ${invoice.title}\n• Số tiền: ${remaining}\n• Hạn nộp: ${dueDateStr}\n• Link quét VietQR tự động: ${paymentLink}\n• Cú pháp chuyển khoản: ${invoice.paymentCode}\nTrân trọng cảm ơn Quý phụ huynh.`;

    const formal = `[THÔNG BÁO HỌC PHÍ - LỚP ${invoice.group.name.toUpperCase()}]\nKính gửi Quý phụ huynh học viên ${invoice.member.name.toUpperCase()},\nBộ phận quản lý xin thông báo phiếu thu học phí của học viên đã đến hạn thanh toán:\n- Tổng số tiền: ${remaining}\n- Hạn chót: ${dueDateStr}\n- Cổng chuyển khoản VietQR chính thức: ${paymentLink}\nKính mong Quý phụ huynh hoàn tất đúng hạn để đảm bảo quyền lợi tham gia học tập của học viên.\nXin chân thành cảm ơn.`;

    return NextResponse.json({
      success: true,
      data: {
        studentName: invoice.member.name,
        groupName: invoice.group.name,
        remaining,
        paymentLink,
        paymentCode: invoice.paymentCode,
        templates: {
          gentle,
          neutral,
          formal,
        },
      },
    });
  } catch (err) {
    console.error('Smart Reminder error:', err);
    return NextResponse.json({ success: false, error: 'Lỗi tạo tin nhắn nhắc nợ' }, { status: 500 });
  }
}
