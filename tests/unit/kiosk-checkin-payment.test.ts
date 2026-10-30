import { describe, it, expect } from 'vitest';
import { generateVietQRUrl } from '@/lib/providers/vietqr';

describe('Kiosk Check-in & Self-Service Payment Business Logic', () => {
  it('generates compliant dynamic VietQR URL for outstanding dues at Kiosk', () => {
    const vietQrUrl = generateVietQRUrl({
      bankId: 'MB',
      accountNo: '0987654321',
      accountName: 'NGUYEN VAN A',
      amount: 450000,
      paymentCode: 'TR8921',
    });

    expect(vietQrUrl).toContain('https://img.vietqr.io/image/MB-0987654321-compact2.png');
    expect(vietQrUrl).toContain('amount=450000');
    expect(vietQrUrl).toContain('addInfo=TR8921');
    expect(vietQrUrl).toContain('accountName=NGUYEN%20VAN%20A');
  });

  it('correctly handles space isolation and code sanitization', () => {
    const rawQrCode = 'TR-MEMBER-clx982103';
    const cleanId = rawQrCode.replace(/^TR-MEMBER-/, '');
    expect(cleanId).toBe('clx982103');

    const phoneCode = '0912345678';
    expect(phoneCode.replace(/^TR-MEMBER-/, '')).toBe('0912345678');
  });

  it('evaluates outstanding dues and debt enforcement policies', () => {
    const invoice = {
      amountDue: 500000,
      amountPaid: 200000,
      status: 'PARTIAL',
    };

    const remainingDue = Math.max(0, invoice.amountDue - invoice.amountPaid);
    expect(remainingDue).toBe(300000);

    // Policy 1: ALLOW_ALL_NOTIFY_DUE -> can check in, shows due
    const policy1: string = 'ALLOW_ALL_NOTIFY_DUE';
    const isBlocked1 = policy1 === 'REQUIRE_PAYMENT_BLOCK' && remainingDue > 0;
    expect(isBlocked1).toBe(false);

    // Policy 2: REQUIRE_PAYMENT_BLOCK -> blocked until paid
    const policy2: string = 'REQUIRE_PAYMENT_BLOCK';
    const isBlocked2 = policy2 === 'REQUIRE_PAYMENT_BLOCK' && remainingDue > 0;
    expect(isBlocked2).toBe(true);
  });

  it('detects completed payment and zero remaining balance', () => {
    const fullyPaidInvoice = {
      amountDue: 500000,
      amountPaid: 500000,
      status: 'PAID',
    };

    const remainingDue = Math.max(0, fullyPaidInvoice.amountDue - fullyPaidInvoice.amountPaid);
    const isPaid = fullyPaidInvoice.status === 'PAID' || remainingDue === 0;

    expect(remainingDue).toBe(0);
    expect(isPaid).toBe(true);
  });

  it('handles hardware barcode scanner input buffers', () => {
    // Simulating hardware barcode scanner keyboard wedge
    const scanBuffer = 'TR-MEMBER-clx123';
    expect(scanBuffer.trim().length >= 3).toBe(true);
    expect(scanBuffer.startsWith('TR-MEMBER-')).toBe(true);
  });
});
