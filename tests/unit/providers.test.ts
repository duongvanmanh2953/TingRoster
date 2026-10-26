import { describe, it, expect } from 'vitest';
import { SePayProvider } from '../../src/lib/providers/sepay';
import { CassoProvider } from '../../src/lib/providers/casso';
import { generateVietQRUrl } from '../../src/lib/providers/vietqr';
import { ProviderType, TransactionDirection } from '@prisma/client';

describe('VietQR Provider', () => {
  it('should generate compliant QuickLink VietQR URL with correct params', () => {
    const url = generateVietQRUrl({
      bankId: 'MB',
      accountNo: '0987654321',
      accountName: 'NGUYEN VAN TUAN',
      amount: 500000,
      paymentCode: 'TR84920',
    });

    expect(url).toContain('https://img.vietqr.io/image/MB-0987654321-compact2.png');
    expect(url).toContain('amount=500000');
    expect(url).toContain('addInfo=TR84920');
    expect(url).toContain('accountName=NGUYEN%20VAN%20TUAN');
  });

  it('should sanitize white spaces and handle lowercase input', () => {
    const url = generateVietQRUrl({
      bankId: 'vcb ',
      accountNo: ' 012 345 6789 ',
      accountName: 'nguyen van a',
      amount: -100, // Negative handled
      paymentCode: ' tr12345 ',
    });

    expect(url).toContain('VCB-0123456789-compact2.png');
    expect(url).toContain('amount=0');
    expect(url).toContain('addInfo=TR12345');
  });
});

describe('SePay Provider Normalization', () => {
  it('should normalize valid SePay payload', () => {
    const rawPayload = {
      id: 92704,
      gateway: 'Vietcombank',
      transactionDate: '2023-03-25 14:02:37',
      accountNumber: '0123456789',
      subAccount: null,
      code: null,
      content: 'TR84920 chuyen tien hoc',
      transferType: 'in',
      transferAmount: 500000,
      referenceCode: 'MBVCB.1234567',
      accumulated: 1500000,
    };

    const tx = SePayProvider.normalize(rawPayload);

    expect(tx.provider).toBe(ProviderType.SEPAY);
    expect(tx.providerTransactionId).toBe('92704');
    expect(tx.amount).toBe(500000);
    expect(tx.content).toBe('TR84920 chuyen tien hoc');
    expect(tx.direction).toBe(TransactionDirection.IN);
    expect(tx.accountNumber).toBe('0123456789');
  });

  it('should detect transferType "out" as OUT direction', () => {
    const rawPayload = {
      id: 92705,
      transactionDate: '2023-03-25 14:02:37',
      content: 'Rut tien',
      transferType: 'out',
      transferAmount: 200000,
    };

    const tx = SePayProvider.normalize(rawPayload);
    expect(tx.direction).toBe(TransactionDirection.OUT);
  });

  it('should verify header with API key secret', () => {
    const valid = SePayProvider.verifyWebhook('Apikey secret_123', 'secret_123');
    expect(valid.isValid).toBe(true);

    const invalid = SePayProvider.verifyWebhook('Apikey wrong_key', 'secret_123');
    expect(invalid.isValid).toBe(false);
  });
});

describe('Casso Provider Normalization', () => {
  it('should normalize Casso transaction item', () => {
    const item = {
      id: 54321,
      tid: 'FT98765',
      description: 'TR84920 dong hoc phi',
      amount: 600000,
      cusum_balance: 10000000,
      when: '2026-10-26 10:00:00',
      bank_sub_acc_id: '0987654321',
    };

    const tx = CassoProvider.normalizeItem(item, { error: 0 });

    expect(tx.provider).toBe(ProviderType.CASSO);
    expect(tx.providerTransactionId).toBe('54321');
    expect(tx.amount).toBe(600000);
    expect(tx.direction).toBe(TransactionDirection.IN);
    expect(tx.content).toBe('TR84920 dong hoc phi');
  });

  it('should verify Casso secure-token header', () => {
    const valid = CassoProvider.verifyWebhook('my_casso_token', 'my_casso_token');
    expect(valid.isValid).toBe(true);

    const invalid = CassoProvider.verifyWebhook('wrong_token', 'my_casso_token');
    expect(invalid.isValid).toBe(false);
  });
});
