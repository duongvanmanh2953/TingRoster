import { describe, it, expect } from 'vitest';
import { InvoiceStatus } from '@prisma/client';

describe('Reconciliation Financial State Transition Logic', () => {
  function computeNewState(amountDue: number, currentPaid: number, incoming: number) {
    const newPaid = currentPaid + incoming;
    let newStatus: InvoiceStatus = InvoiceStatus.PARTIAL;
    if (newPaid === amountDue) {
      newStatus = InvoiceStatus.PAID;
    } else if (newPaid > amountDue) {
      newStatus = InvoiceStatus.OVERPAID;
    } else {
      newStatus = InvoiceStatus.PARTIAL;
    }
    const remaining = Math.max(0, amountDue - newPaid);
    const excess = Math.max(0, newPaid - amountDue);
    return { newPaid, newStatus, remaining, excess };
  }

  it('should transition UNPAID to PARTIAL on underpayment', () => {
    const result = computeNewState(500000, 0, 200000);
    expect(result.newPaid).toBe(200000);
    expect(result.newStatus).toBe(InvoiceStatus.PARTIAL);
    expect(result.remaining).toBe(300000);
    expect(result.excess).toBe(0);
  });

  it('should transition PARTIAL to PAID on exact remaining payment', () => {
    const result = computeNewState(500000, 200000, 300000);
    expect(result.newPaid).toBe(500000);
    expect(result.newStatus).toBe(InvoiceStatus.PAID);
    expect(result.remaining).toBe(0);
    expect(result.excess).toBe(0);
  });

  it('should transition UNPAID directly to PAID on exact full payment', () => {
    const result = computeNewState(500000, 0, 500000);
    expect(result.newPaid).toBe(500000);
    expect(result.newStatus).toBe(InvoiceStatus.PAID);
    expect(result.remaining).toBe(0);
  });

  it('should transition to OVERPAID and accurately compute excess money without loss', () => {
    const result = computeNewState(500000, 200000, 400000); // Total 600,000 paid
    expect(result.newPaid).toBe(600000);
    expect(result.newStatus).toBe(InvoiceStatus.OVERPAID);
    expect(result.remaining).toBe(0);
    expect(result.excess).toBe(100000);
  });
});
