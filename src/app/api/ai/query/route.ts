import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { formatVND } from '@/lib/utils';
import { InvoiceStatus, ProcessingStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const { question } = await req.json();
    if (!question || typeof question !== 'string') {
      return NextResponse.json({ success: false, error: 'Thiếu câu hỏi' }, { status: 400 });
    }

    const q = question.toLowerCase().trim();

    // Intent 1: Lớp nào nợ nhiều nhất?
    if (q.includes('nợ nhiều nhất') || q.includes('công nợ') || q.includes('chưa đóng nhiều')) {
      const groups = await prisma.group.findMany({
        where: { userId, isActive: true },
        include: {
          invoices: {
            where: { status: { in: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIAL] } },
            select: { amountDue: true, amountPaid: true, member: { select: { name: true } } },
          },
        },
      });

      let highestDebtGroup = null;
      let maxDebt = 0;

      for (const g of groups) {
        let debt = 0;
        for (const inv of g.invoices) {
          debt += (inv.amountDue - inv.amountPaid);
        }
        if (debt > maxDebt) {
          maxDebt = debt;
          highestDebtGroup = g;
        }
      }

      if (highestDebtGroup && maxDebt > 0) {
        const studentList = highestDebtGroup.invoices.map((i) => i.member.name).slice(0, 3).join(', ');
        return NextResponse.json({
          success: true,
          data: {
            answer: `📊 Lớp có số tiền còn nợ nhiều nhất hiện tại là **${highestDebtGroup.name}** với tổng số nợ là **${formatVND(maxDebt)}** (${highestDebtGroup.invoices.length} khoản thu chưa đóng, tiêu biểu gồm: ${studentList}...).`,
            metric: formatVND(maxDebt),
            targetUrl: `/groups/${highestDebtGroup.id}`,
          },
        });
      } else {
        return NextResponse.json({
          success: true,
          data: {
            answer: '🎉 Tuyệt vời! Hiện tại tất cả các lớp của bạn đều đã hoàn thành đóng học phí, không có lớp nào bị nợ.',
            metric: '0 ₫',
          },
        });
      }
    }

    // Intent 2: Hóa đơn quá hạn
    if (q.includes('quá hạn') || q.includes('trễ hạn') || q.includes('chưa đóng')) {
      const overdue = await prisma.invoice.findMany({
        where: {
          userId,
          status: { in: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIAL] },
          dueDate: { lt: new Date() },
        },
        include: { member: { select: { name: true } }, group: { select: { name: true } } },
        take: 5,
      });

      if (overdue.length > 0) {
        const details = overdue
          .map((inv) => `• **${inv.member.name}** (${inv.group.name}): nợ ${formatVND(inv.amountDue - inv.amountPaid)}`)
          .join('\n');

        return NextResponse.json({
          success: true,
          data: {
            answer: `⚠️ Có **${overdue.length}** khoản thu đã quá hạn cần nhắc nhở:\n\n${details}\n\nBạn có thể gửi tin nhắn nhắc nợ lịch sự bằng công cụ Smart Reminder của TingRoster.`,
            count: overdue.length,
            targetUrl: '/invoices?status=UNPAID',
          },
        });
      } else {
        return NextResponse.json({
          success: true,
          data: {
            answer: '✅ Không có hóa đơn nào bị quá hạn thanh toán.',
          },
        });
      }
    }

    // Intent 3: Giao dịch chưa khớp
    if (q.includes('chưa khớp') || q.includes('sai nội dung') || q.includes('giao dịch lạ')) {
      const unmatched = await prisma.transactionLog.findMany({
        where: { processingStatus: ProcessingStatus.UNMATCHED },
        take: 3,
      });

      if (unmatched.length > 0) {
        const totalUnmatchedAmount = unmatched.reduce((acc, t) => acc + t.amount, 0);
        return NextResponse.json({
          success: true,
          data: {
            answer: `🔔 Hệ thống phát hiện **${unmatched.length}** giao dịch chuyển khoản chưa khớp (tổng tiền: **${formatVND(totalUnmatchedAmount)}**). Nguyên nhân chủ yếu là do người chuyển không ghi mã thanh toán. Hãy vào mục Đối soát để gán thủ công một chạm.`,
            count: unmatched.length,
            targetUrl: '/transactions?tab=UNMATCHED',
          },
        });
      } else {
        return NextResponse.json({
          success: true,
          data: {
            answer: '✨ Mọi giao dịch ngân hàng đều đã được đối soát và gạch nợ tự động chính xác 100%. Không có giao dịch nào bị treo.',
          },
        });
      }
    }

    // Default: Tổng quan thu phí
    const invoices = await prisma.invoice.findMany({
      where: { userId, status: { not: InvoiceStatus.VOID } },
      select: { amountDue: true, amountPaid: true },
    });

    const totalDue = invoices.reduce((a, b) => a + b.amountDue, 0);
    const totalPaid = invoices.reduce((a, b) => a + b.amountPaid, 0);
    const remaining = Math.max(0, totalDue - totalPaid);

    return NextResponse.json({
      success: true,
      data: {
        answer: `📈 Tổng hợp tài chính toàn bộ hệ thống:\n• Tổng cần thu: **${formatVND(totalDue)}**\n• Đã thu thực tế: **${formatVND(totalPaid)}**\n• Còn phải thu: **${formatVND(remaining)}**\n\nBạn có thể hỏi thêm: *"Lớp nào nợ nhiều nhất?"*, *"Hóa đơn quá hạn"*, hoặc *"Có giao dịch nào chưa khớp không?"*`,
      },
    });
  } catch (err) {
    console.error('AI Query error:', err);
    return NextResponse.json({ success: false, error: 'Lỗi truy vấn AI' }, { status: 500 });
  }
}
