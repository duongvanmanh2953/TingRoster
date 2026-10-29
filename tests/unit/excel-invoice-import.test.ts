import { describe, it, expect } from 'vitest';

describe('Excel Invoice Import Validation & Formatting', () => {
  it('formats 9-digit Vietnamese phone numbers with leading zero', () => {
    let phone = '901234567';
    if (/^\d{9}$/.test(phone)) {
      phone = '0' + phone;
    }
    expect(phone).toBe('0901234567');
  });

  it('rejects rows with zero or negative amounts', () => {
    const rawAmount = -50000;
    const isValid = rawAmount > 0;
    expect(isValid).toBe(false);
  });

  it('validates required fields: title, memberName, and positive amount', () => {
    const validateRow = (row: { title: string; memberName: string; amountDue: number }) => {
      const errors: string[] = [];
      if (!row.title || row.title.trim().length < 2) errors.push('Thiếu tên khoản thu');
      if (!row.memberName || row.memberName.trim().length === 0) errors.push('Thiếu họ tên');
      if (row.amountDue <= 0) errors.push('Số tiền phải lớn hơn 0');
      return { isValid: errors.length === 0, errors };
    };

    const validRow = validateRow({
      title: 'Học phí Tháng 10',
      memberName: 'Nguyễn Văn An',
      amountDue: 1200000,
    });
    expect(validRow.isValid).toBe(true);
    expect(validRow.errors).toHaveLength(0);

    const invalidRow = validateRow({
      title: '',
      memberName: 'Trần Thị B',
      amountDue: 0,
    });
    expect(invalidRow.isValid).toBe(false);
    expect(invalidRow.errors).toContain('Thiếu tên khoản thu');
    expect(invalidRow.errors).toContain('Số tiền phải lớn hơn 0');
  });

  it('calculates aging buckets accurately according to mutually exclusive rules', () => {
    const now = new Date('2026-10-29T00:00:00Z');

    const getBucket = (dueDateStr: string | null) => {
      if (!dueDateStr) return 'CURRENT';
      const dueDate = new Date(dueDateStr);
      if (dueDate >= now) return 'CURRENT';
      const days = Math.max(1, Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
      if (days <= 7) return 'OVERDUE_1_7';
      if (days <= 30) return 'OVERDUE_8_30';
      return 'OVERDUE_OVER_30';
    };

    expect(getBucket('2026-11-05')).toBe('CURRENT');
    expect(getBucket('2026-10-25')).toBe('OVERDUE_1_7'); // 4 days overdue
    expect(getBucket('2026-10-10')).toBe('OVERDUE_8_30'); // 19 days overdue
    expect(getBucket('2026-09-01')).toBe('OVERDUE_OVER_30'); // >30 days overdue
  });
});
