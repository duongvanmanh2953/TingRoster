import { ProviderType, TransactionDirection } from '@prisma/client';
import { NormalizedBankTransaction, WebhookVerificationResult } from './types';
import { z } from 'zod';

export const CassoTransactionItemSchema = z.object({
  id: z.union([z.number(), z.string()]),
  tid: z.string().optional(),
  description: z.string(),
  amount: z.number().int(),
  cusum_balance: z.number().optional(),
  when: z.string(),
  bank_sub_acc_id: z.string().optional(),
});

export const CassoPayloadSchema = z.object({
  error: z.number().optional(),
  data: z.array(CassoTransactionItemSchema),
});

export class CassoProvider {
  /**
   * Verify Casso webhook secure-token header
   */
  static verifyWebhook(
    secureTokenHeader: string | null | undefined,
    expectedSecret?: string
  ): WebhookVerificationResult {
    const secret = expectedSecret || process.env.CASSO_WEBHOOK_SECURE_TOKEN;
    if (!secret) {
      return { isValid: true };
    }

    if (!secureTokenHeader || secureTokenHeader.trim() !== secret.trim()) {
      return { isValid: false, error: 'Token bảo mật Casso không khớp (secure-token)' };
    }

    return { isValid: true };
  }

  /**
   * Normalize an individual Casso transaction item
   */
  static normalizeItem(
    item: z.infer<typeof CassoTransactionItemSchema>,
    rawPayload: Record<string, unknown>
  ): NormalizedBankTransaction {
    const direction: TransactionDirection =
      item.amount >= 0 ? TransactionDirection.IN : TransactionDirection.OUT;

    let txDate = new Date(item.when);
    if (isNaN(txDate.getTime())) {
      txDate = new Date();
    }

    return {
      provider: ProviderType.CASSO,
      providerTransactionId: String(item.id),
      accountNumber: item.bank_sub_acc_id,
      amount: Math.abs(item.amount),
      content: item.description || '',
      direction,
      transactionDate: txDate,
      rawPayload,
    };
  }
}
