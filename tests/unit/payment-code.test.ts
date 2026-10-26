import { describe, it, expect } from 'vitest';
import {
  extractPaymentCode,
  normalizeTransferContent,
  generateRandomPaymentCode,
  PAYMENT_CODE_REGEX,
} from '../../src/lib/reconciliation/payment-code';

describe('Payment Code Normalization & Extraction', () => {
  it('should remove Vietnamese accents and convert to uppercase', () => {
    const raw = 'Nguyễn Văn An chuyển tiền học phí Đã đóng';
    const normalized = normalizeTransferContent(raw);
    expect(normalized).toBe('NGUYEN VAN AN CHUYEN TIEN HOC PHI DA DONG');
  });

  it('should extract valid payment code with standard format', () => {
    const content = 'MBVCB.123456 TR84920 chuyen hoc phi';
    const code = extractPaymentCode(content);
    expect(code).toBe('TR84920');
  });

  it('should extract payment code at the beginning of content', () => {
    const content = 'TR12345 dong tien hoc';
    const code = extractPaymentCode(content);
    expect(code).toBe('TR12345');
  });

  it('should extract payment code at the end of content', () => {
    const content = 'Hoc phi thang 10 TR54321';
    const code = extractPaymentCode(content);
    expect(code).toBe('TR54321');
  });

  it('should extract payment code surrounded by special punctuation', () => {
    const content = 'CT tu 098765-TR99999-HOCPHI';
    const code = extractPaymentCode(content);
    expect(code).toBe('TR99999');
  });

  it('should NOT extract payment code if part of longer alphanumeric word', () => {
    const content = 'Ma giao dich EXTRA8492012 khong hop le';
    const code = extractPaymentCode(content);
    expect(code).toBeNull();
  });

  it('should return null if content is empty or lacks code', () => {
    expect(extractPaymentCode('')).toBeNull();
    expect(extractPaymentCode('Chuyen tien hoc phi cho con')).toBeNull();
  });

  it('should generate cryptographically secure payment code matching TR[0-9]{5}', () => {
    for (let i = 0; i < 20; i++) {
      const code = generateRandomPaymentCode();
      expect(code).toMatch(/^TR[0-9]{5}$/);
    }
  });
});
