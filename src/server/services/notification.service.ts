import { prisma } from '@/lib/db/prisma';
import { NotificationChannel, NotificationStatus } from '@prisma/client';
import { formatVND } from '@/lib/utils';

export interface PaymentNotificationParams {
  userId: string;
  invoiceId: string;
  studentName: string;
  groupName: string;
  amount: number;
  paymentCode: string;
  status: string;
}

export class NotificationService {
  /**
   * Send Telegram notification asynchronously if configured
   */
  static async notifyPaymentSuccess(params: PaymentNotificationParams): Promise<void> {
    const { userId, invoiceId, studentName, groupName, amount, paymentCode, status } = params;

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    const message = ` TingRoster - Nhận tiền thành công!\n` +
      `• Học viên: ${studentName}\n` +
      `• Lớp: ${groupName}\n` +
      `• Số tiền: ${formatVND(amount)}\n` +
      `• Mã: ${paymentCode}\n` +
      `• Trạng thái: ${status === 'PAID' ? 'Đã đóng đủ' : 'Đóng một phần'}`;

    if (!botToken || !chatId) {
      // Just record log as PENDING/SKIPPED
      try {
        await prisma.notificationLog.create({
          data: {
            userId,
            invoiceId,
            channel: NotificationChannel.TELEGRAM,
            recipient: 'NOT_CONFIGURED',
            message,
            status: NotificationStatus.PENDING,
          },
        });
      } catch (err) {
        console.error('Failed to write notification log:', err);
      }
      return;
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      const resJson = await response.json().catch(() => ({}));
      await prisma.notificationLog.create({
        data: {
          userId,
          invoiceId,
          channel: NotificationChannel.TELEGRAM,
          recipient: chatId,
          message,
          status: response.ok ? NotificationStatus.SENT : NotificationStatus.FAILED,
          responsePayload: JSON.stringify(resJson),
        },
      });
    } catch (err) {
      console.error('Telegram notification error:', err);
      try {
        await prisma.notificationLog.create({
          data: {
            userId,
            invoiceId,
            channel: NotificationChannel.TELEGRAM,
            recipient: chatId,
            message,
            status: NotificationStatus.FAILED,
            responsePayload: String(err),
          },
        });
      } catch {
        // Ignore secondary log failures
      }
    }
  }
}
