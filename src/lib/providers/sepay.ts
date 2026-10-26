import { ProviderType, TransactionDirection } from '@prisma/client';
import { NormalizedBankTransaction, WebhookVerificationResult } from './types';
import { z } from 'zod';

export const SePayPayloadSchema = z.object({
  id: z.union([z.number(), z.string()]),
  gateway: z.string().optional(),
  transactionDate: z.string(),
  accountNumber: z.string().optional(),
  subAccount: z.string().nullable().optional(),
  code: z.string().nullable().optional(),
  content: z.string(),
  transferType: z.string(), // "in" | "out"
  transferAmount: z.number().int().nonnegative(),
  referenceCode: z.string().nullable().optional(),
  accumulated: z.number().optional(),
});

export type SePayPayload = z.infer<typeof SePayPayloadSchema>;

export class SePayProvider {
  /**
   * Verify webhook authorization header.
   * SePay sends header 'Authorization: Apikey <API_KEY>' or 'Authorization: <API_KEY>'
   */
  static verifyWebhook(
    authHeader: string | null | undefined,
    expectedApiKey?: string
  ): WebhookVerificationResult {
    const secret = expectedApiKey || process.env.SEPAY_WEBHOOK_API_KEY;
    if (!secret) {
      // In development if no secret set, allow or warn
      return { isValid: true };
    }

    if (!authHeader) {
      return { isValid: false, error: 'Thiếu header xác thực Authorization' };
    }

    const token = authHeader.replace(/^Apikey\s+/i, '').replace(/^Bearer\s+/i, '').trim();
    if (token !== secret) {
      return { isValid: false, error: 'Khóa xác thực SePay API Key không hợp lệ' };
    }

    return { isValid: true };
  }

  /**
   * Normalize SePay webhook payload into standard BankTransaction
   */
  static normalize(payload: unknown): NormalizedBankTransaction {
    const parsed = SePayPayloadSchema.parse(payload);

    const direction: TransactionDirection =
      parsed.transferType.toLowerCase() === 'in'
        ? TransactionDirection.IN
        : TransactionDirection.OUT;

    // Parse transaction date
    let txDate = new Date(parsed.transactionDate);
    if (isNaN(txDate.getTime())) {
      txDate = new Date();
    }

    return {
      provider: ProviderType.SEPAY,
      providerTransactionId: String(parsed.id),
      accountNumber: parsed.accountNumber,
      amount: parsed.transferAmount,
      content: parsed.content || '',
      direction,
      transactionDate: txDate,
      rawPayload: payload as Record<string, unknown>,
    };
  }
}
