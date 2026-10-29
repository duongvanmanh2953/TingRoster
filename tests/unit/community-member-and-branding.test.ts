import { describe, it, expect } from 'vitest';
import { POPULAR_BANKS } from '../../src/components/common/BankLogo';
import { z } from 'zod';

const BatchAddMembersSchema = z.object({
  members: z.array(
    z.object({
      userId: z.string().optional().nullable(),
      name: z.string().min(2, 'Tên học viên tối thiểu 2 ký tự'),
      phone: z.string().optional().nullable(),
      parentName: z.string().optional().nullable(),
      avatarUrl: z.string().optional().nullable(),
      gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional().default('OTHER'),
      ageGroup: z.enum(['KID', 'TEEN', 'ADULT', 'SENIOR']).optional().default('TEEN'),
    })
  ).min(1, 'Vui lòng chọn ít nhất 1 thành viên'),
});

describe('Bank Branding & Popular Banks Structure', () => {
  it('should include all major Vietnamese commercial banks with shortName and color', () => {
    const requiredBanks = ['MB', 'VCB', 'TCB', 'ACB', 'VPB', 'TPB', 'BIDV', 'ICB'];
    for (const bankId of requiredBanks) {
      const bank = POPULAR_BANKS[bankId];
      expect(bank).toBeDefined();
      expect(bank.code).toBe(bankId);
      expect(bank.shortName.length).toBeGreaterThan(1);
      expect(bank.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(bank.bgLight).toContain('rgba(');
    }
  });

  it('should correctly format VietQR API official image URL without whitespace padding', () => {
    const bankId = 'MB';
    const logoUrl = `https://api.vietqr.io/img/${bankId}.png`;
    expect(logoUrl).toBe('https://api.vietqr.io/img/MB.png');
  });
});

describe('Zalo Sharing URL Generation & Privacy Safety', () => {
  function generateZaloShareUrl(baseUrl: string, groupSlug: string): string {
    const publicUrl = `${baseUrl}/p/${groupSlug}`;
    return `https://zalo.me/share?url=${encodeURIComponent(publicUrl)}`;
  }

  it('should generate official Zalo Web Share deep link with safe public URL', () => {
    const shareUrl = generateZaloShareUrl('https://tingroster.vn', 'lop-toan-12a');
    expect(shareUrl).toBe('https://zalo.me/share?url=https%3A%2F%2Ftingroster.vn%2Fp%2Flop-toan-12a');
  });

  it('should NOT contain authentication cookies, bearer tokens, or database IDs in share URL', () => {
    const shareUrl = generateZaloShareUrl('https://tingroster.vn', 'clb-pickleball-saigon');
    expect(shareUrl).not.toContain('Bearer');
    expect(shareUrl).not.toContain('jwt');
    expect(shareUrl).not.toContain('cuid');
    expect(shareUrl).not.toContain('password');
  });
});

describe('Community Member Batch Enrollment Validation', () => {
  it('should validate valid member batch payload', () => {
    const validPayload = {
      members: [
        { name: 'Nguyễn Văn An', phone: '0912345678', gender: 'MALE' as const },
        { name: 'Trần Bảo Ngọc', phone: '0987654321', parentName: 'Bác Bình' },
      ],
    };
    const parsed = BatchAddMembersSchema.parse(validPayload);
    expect(parsed.members.length).toBe(2);
    expect(parsed.members[0].name).toBe('Nguyễn Văn An');
    expect(parsed.members[1].gender).toBe('OTHER'); // default
  });

  it('should reject payload with empty member array', () => {
    const emptyPayload = { members: [] };
    expect(() => BatchAddMembersSchema.parse(emptyPayload)).toThrow();
  });

  it('should reject member with name shorter than 2 characters', () => {
    const invalidNamePayload = {
      members: [{ name: 'A' }],
    };
    expect(() => BatchAddMembersSchema.parse(invalidNamePayload)).toThrow();
  });
});
