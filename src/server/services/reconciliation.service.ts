import { prisma } from '@/lib/db/prisma';
import { NormalizedBankTransaction } from '@/lib/providers/types';
import { extractPaymentCode } from '@/lib/reconciliation/payment-code';
import {
  InvoiceStatus,
  ProcessingStatus,
  TransactionDirection,
  OutboxStatus,
} from '@prisma/client';
import { NotificationService } from './notification.service';

export interface ReconciliationResult {
  success: boolean;
  duplicate?: boolean;
  status: ProcessingStatus;
  message: string;
  transactionLogId?: string;
  invoiceId?: string;
  paymentCode?: string;
  newInvoiceStatus?: InvoiceStatus;
  amountAllocated?: number;
}

export class ReconciliationService {
  /**
   * Process a normalized bank transaction atomically with idempotency and audit trail
   */
  static async reconcileTransaction(tx: NormalizedBankTransaction): Promise<ReconciliationResult> {
    const rawPayloadStr = JSON.stringify(tx.rawPayload || {});

    // 1. Idempotency check: see if provider transaction already processed
    const existingTx = await prisma.transactionLog.findUnique({
      where: {
        provider_providerTransactionId: {
          provider: tx.provider,
          providerTransactionId: tx.providerTransactionId,
        },
      },
    });

    if (existingTx) {
      return {
        success: true,
        duplicate: true,
        status: existingTx.processingStatus,
        message: 'Giao dịch đã được ghi nhận trước đó (Idempotent response)',
        transactionLogId: existingTx.id,
        invoiceId: existingTx.matchedInvoiceId || undefined,
      };
    }

    // 2. Direction check: If money OUT, ignore from invoice reconciliation
    if (tx.direction === TransactionDirection.OUT) {
      const createdTx = await prisma.transactionLog.create({
        data: {
          provider: tx.provider,
          providerTransactionId: tx.providerTransactionId,
          rawPayload: rawPayloadStr,
          amount: tx.amount,
          content: tx.content,
          direction: TransactionDirection.OUT,
          transactionDate: tx.transactionDate,
          processingStatus: ProcessingStatus.IGNORED,
          failureReason: 'Giao dịch chuyển tiền ra (OUT) - không áp dụng thu phí',
        },
      });

      return {
        success: true,
        status: ProcessingStatus.IGNORED,
        message: 'Giao dịch tiền ra được ghi log và bỏ qua đối soát',
        transactionLogId: createdTx.id,
      };
    }

    // 3. Extract payment code
    const paymentCode = extractPaymentCode(tx.content);

    if (!paymentCode) {
      const createdTx = await prisma.transactionLog.create({
        data: {
          provider: tx.provider,
          providerTransactionId: tx.providerTransactionId,
          rawPayload: rawPayloadStr,
          amount: tx.amount,
          content: tx.content,
          direction: TransactionDirection.IN,
          transactionDate: tx.transactionDate,
          processingStatus: ProcessingStatus.UNMATCHED,
          failureReason: 'Không tìm thấy mã thanh toán (TRxxxxx) trong nội dung chuyển khoản',
        },
      });

      // Write Outbox event for unmatched transaction
      await prisma.outboxEvent.create({
        data: {
          eventType: 'TRANSACTION_UNMATCHED',
          payload: JSON.stringify({
            transactionLogId: createdTx.id,
            amount: tx.amount,
            content: tx.content,
          }),
          status: OutboxStatus.PENDING,
        },
      });

      return {
        success: true,
        status: ProcessingStatus.UNMATCHED,
        message: 'Không tìm thấy mã thanh toán trong nội dung chuyển tiền',
        transactionLogId: createdTx.id,
      };
    }

    // 4. Find matching invoice
    const invoice = await prisma.invoice.findUnique({
      where: { paymentCode },
      include: {
        member: true,
        group: true,
        user: true,
      },
    });

    if (!invoice) {
      const createdTx = await prisma.transactionLog.create({
        data: {
          provider: tx.provider,
          providerTransactionId: tx.providerTransactionId,
          rawPayload: rawPayloadStr,
          amount: tx.amount,
          content: tx.content,
          direction: TransactionDirection.IN,
          transactionDate: tx.transactionDate,
          processingStatus: ProcessingStatus.UNMATCHED,
          failureReason: `Mã thanh toán ${paymentCode} không khớp với hóa đơn nào trong hệ thống`,
        },
      });

      return {
        success: true,
        status: ProcessingStatus.UNMATCHED,
        message: `Mã thanh toán ${paymentCode} không tồn tại`,
        transactionLogId: createdTx.id,
      };
    }

    if (invoice.status === InvoiceStatus.VOID) {
      const createdTx = await prisma.transactionLog.create({
        data: {
          userId: invoice.userId,
          provider: tx.provider,
          providerTransactionId: tx.providerTransactionId,
          rawPayload: rawPayloadStr,
          amount: tx.amount,
          content: tx.content,
          direction: TransactionDirection.IN,
          transactionDate: tx.transactionDate,
          matchedInvoiceId: invoice.id,
          processingStatus: ProcessingStatus.UNMATCHED,
          failureReason: 'Hóa đơn tương ứng đã bị hủy (VOID)',
        },
      });

      return {
        success: true,
        status: ProcessingStatus.UNMATCHED,
        message: 'Hóa đơn đã bị hủy',
        transactionLogId: createdTx.id,
        invoiceId: invoice.id,
      };
    }

    // 5. Calculate new invoice financial state
    const previousPaid = invoice.amountPaid;
    const incomingAmount = tx.amount;
    const newAmountPaid = previousPaid + incomingAmount;
    const amountDue = invoice.amountDue;

    let newStatus: InvoiceStatus = InvoiceStatus.PARTIAL;
    if (newAmountPaid === amountDue) {
      newStatus = InvoiceStatus.PAID;
    } else if (newAmountPaid > amountDue) {
      newStatus = InvoiceStatus.OVERPAID;
    } else {
      newStatus = InvoiceStatus.PARTIAL;
    }

    // 6. Execute atomic database transaction
    const result = await prisma.$transaction(async (prismaTx) => {
      // Create TransactionLog
      const txLog = await prismaTx.transactionLog.create({
        data: {
          userId: invoice.userId,
          provider: tx.provider,
          providerTransactionId: tx.providerTransactionId,
          rawPayload: rawPayloadStr,
          matchedInvoiceId: invoice.id,
          amount: incomingAmount,
          content: tx.content,
          direction: TransactionDirection.IN,
          transactionDate: tx.transactionDate,
          processingStatus: ProcessingStatus.PROCESSED,
        },
      });

      // Create PaymentAllocation
      await prismaTx.paymentAllocation.create({
        data: {
          transactionLogId: txLog.id,
          invoiceId: invoice.id,
          amount: incomingAmount,
        },
      });

      // Update Invoice
      const updatedInvoice = await prismaTx.invoice.update({
        where: { id: invoice.id },
        data: {
          amountPaid: newAmountPaid,
          status: newStatus,
          paidAt:
            newStatus === InvoiceStatus.PAID || newStatus === InvoiceStatus.OVERPAID
              ? tx.transactionDate
              : invoice.paidAt,
        },
      });

      // Create AuditLog
      await prismaTx.auditLog.create({
        data: {
          userId: invoice.userId,
          action: 'AUTO_RECONCILE',
          entityType: 'INVOICE',
          entityId: invoice.id,
          details: JSON.stringify({
            paymentCode,
            provider: tx.provider,
            providerTransactionId: tx.providerTransactionId,
            incomingAmount,
            previousPaid,
            newAmountPaid,
            amountDue,
            oldStatus: invoice.status,
            newStatus,
          }),
        },
      });

      // Create OutboxEvent
      await prismaTx.outboxEvent.create({
        data: {
          eventType: newStatus === InvoiceStatus.PAID ? 'INVOICE_PAID' : 'PAYMENT_RECEIVED',
          payload: JSON.stringify({
            invoiceId: invoice.id,
            userId: invoice.userId,
            studentName: invoice.member.name,
            groupName: invoice.group.name,
            paymentCode,
            amountPaid: incomingAmount,
            totalPaid: newAmountPaid,
            status: newStatus,
          }),
          status: OutboxStatus.PENDING,
        },
      });

      return { txLog, updatedInvoice };
    });

    // 7. Post-commit: Asynchronous notification (never rolls back database transaction)
    NotificationService.notifyPaymentSuccess({
      userId: invoice.userId,
      invoiceId: invoice.id,
      studentName: invoice.member.name,
      groupName: invoice.group.name,
      amount: incomingAmount,
      paymentCode,
      status: newStatus,
    }).catch((err) => console.error('Background notification failed:', err));

    return {
      success: true,
      status: ProcessingStatus.PROCESSED,
      message: `Đối soát thành công cho học viên ${invoice.member.name} (${newStatus})`,
      transactionLogId: result.txLog.id,
      invoiceId: invoice.id,
      paymentCode,
      newInvoiceStatus: newStatus,
      amountAllocated: incomingAmount,
    };
  }
}
