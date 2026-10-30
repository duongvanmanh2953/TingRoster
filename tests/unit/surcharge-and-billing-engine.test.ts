import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SurchargeService } from '@/server/services/surcharge.service';
import { prisma } from '@/lib/db/prisma';

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    group: {
      findFirst: vi.fn(),
    },
    member: {
      findFirst: vi.fn(),
    },
    surchargeProposal: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    invoice: {
      create: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  },
}));

vi.mock('@/lib/reconciliation/payment-code', () => ({
  generateUniquePaymentCode: vi.fn().mockResolvedValue('TR-SUR-8492'),
}));

describe('SurchargeService & Mutual Acceptance Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects proposal if title, amount or reason is empty', async () => {
    (prisma.group.findFirst as any).mockResolvedValue({
      id: 'grp-1',
      userId: 'usr-1',
      user: { name: 'Owner A' },
    });
    (prisma.member.findFirst as any).mockResolvedValue({
      id: 'mem-1',
      name: 'Student B',
    });

    await expect(
      SurchargeService.createProposal('grp-1', 'usr-1', {
        memberId: 'mem-1',
        title: '',
        category: 'NEW_INCIDENTAL',
        amount: 100000,
        reason: 'Valid reason',
      })
    ).rejects.toThrow('Tiêu đề phụ thu không được để trống');

    await expect(
      SurchargeService.createProposal('grp-1', 'usr-1', {
        memberId: 'mem-1',
        title: 'Phí vệ sinh',
        category: 'NEW_INCIDENTAL',
        amount: 0,
        reason: 'Valid reason',
      })
    ).rejects.toThrow('Số tiền phụ thu phải lớn hơn 0');

    await expect(
      SurchargeService.createProposal('grp-1', 'usr-1', {
        memberId: 'mem-1',
        title: 'Phí vệ sinh',
        category: 'NEW_INCIDENTAL',
        amount: 50000,
        reason: '',
      })
    ).rejects.toThrow('Lý do phụ thu / bồi hoàn phải được giải trình rõ ràng');
  });

  it('sets initial status to ACCEPTED for PRE_AGREED, but PROPOSED for NEW_INCIDENTAL', async () => {
    (prisma.group.findFirst as any).mockResolvedValue({
      id: 'grp-1',
      userId: 'usr-1',
      user: { name: 'Owner A' },
    });
    (prisma.member.findFirst as any).mockResolvedValue({
      id: 'mem-1',
      name: 'Student B',
    });

    (prisma.surchargeProposal.create as any).mockImplementation(({ data }: any) => ({
      id: 'sur-1',
      ...data,
      member: { id: 'mem-1', name: 'Student B' },
    }));

    const preAgreed = await SurchargeService.createProposal('grp-1', 'usr-1', {
      memberId: 'mem-1',
      title: 'Phí gửi xe theo hợp đồng',
      category: 'PRE_AGREED',
      amount: 100000,
      reason: 'Điều 3.1 HĐ-202',
    });
    expect(preAgreed.status).toBe('ACCEPTED');

    const incidental = await SurchargeService.createProposal('grp-1', 'usr-1', {
      memberId: 'mem-1',
      title: 'Phí dọn rác phát sinh',
      category: 'NEW_INCIDENTAL',
      amount: 70000,
      reason: 'Sự kiện đột xuất cuối tuần',
    });
    expect(incidental.status).toBe('PROPOSED');
  });

  it('STRICT GUARD: Refuses to convert disputed or unaccepted surcharge to invoice', async () => {
    (prisma.surchargeProposal.findUnique as any).mockResolvedValue({
      id: 'sur-dispute',
      groupId: 'grp-1',
      memberId: 'mem-1',
      title: 'Khoản phạt vỡ kính',
      amount: 500000,
      status: 'DISPUTED',
      group: { userId: 'usr-1' },
      member: { id: 'mem-1' },
    });

    await expect(
      SurchargeService.convertToInvoice('sur-dispute', 'usr-1')
    ).rejects.toThrow('Không thể xuất hóa đơn cho khoản phụ thu đang ở trạng thái "DISPUTED"');
  });

  it('allows converting ACCEPTED surcharge to invoice and creates itemized line item', async () => {
    (prisma.surchargeProposal.findUnique as any).mockResolvedValue({
      id: 'sur-acc',
      groupId: 'grp-1',
      memberId: 'mem-1',
      title: 'Phí vệ sinh phòng máy lạnh',
      amount: 150000,
      category: 'NEW_INCIDENTAL',
      reason: 'Bên B đồng ý vệ sinh sâu trước khi dọn vào',
      status: 'ACCEPTED',
      group: { userId: 'usr-1' },
      member: { id: 'mem-1' },
    });

    (prisma.invoice.create as any).mockResolvedValue({
      id: 'inv-sur-1',
      amountDue: 150000,
      status: 'UNPAID',
    });

    (prisma.surchargeProposal.update as any).mockResolvedValue({
      id: 'sur-acc',
      invoicedAt: new Date(),
    });

    const invoice = await SurchargeService.convertToInvoice('sur-acc', 'usr-1');
    expect(invoice.id).toBe('inv-sur-1');
    expect(prisma.invoice.create).toHaveBeenCalled();
  });
});
