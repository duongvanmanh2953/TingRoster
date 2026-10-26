import { ProviderType, TransactionDirection } from '@prisma/client';

export interface NormalizedBankTransaction {
  provider: ProviderType;
  providerTransactionId: string;
  accountNumber?: string;
  amount: number; // Integer VND
  content: string;
  direction: TransactionDirection;
  transactionDate: Date;
  rawPayload: Record<string, unknown>;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  error?: string;
}
