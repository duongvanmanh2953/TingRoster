import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';
import {
  calculateContentHash,
  verifyContentIntegrity,
  generateContractDocxBuffer
} from '@/server/services/contract.service';
import {
  generateTemporaryIdentifier,
  generateActivationCode,
  isTemporaryAccountValid
} from '@/server/services/temporaryAccount.service';
import {
  extractVietnameseContractEntities,
  classifyContractDocument
} from '@/server/services/ocrDocument.service';

describe('Contracts & Digital Signatures Service', () => {
  it('should calculate valid SHA-256 content hash', () => {
    const content = '<p>Thỏa thuận thuê nhà giữa Bên A và Bên B</p>';
    const hash = calculateContentHash(content);

    expect(hash).toHaveLength(64);
    expect(typeof hash).toBe('string');

    // Verify integrity succeeds for exact match
    expect(verifyContentIntegrity(content, hash)).toBe(true);

    // Verify integrity fails if content is altered even by 1 char
    const tamperedContent = '<p>Thỏa thuận thuê nhà giữa Bên A và Bên B!</p>';
    expect(verifyContentIntegrity(tamperedContent, hash)).toBe(false);
  });

  it('should generate valid editable DOCX buffer', async () => {
    const docxBuffer = await generateContractDocxBuffer({
      title: 'Hợp Đồng Thuê Nhà Ở Chuẩn Pháp Lý 2026',
      code: 'HD-2026-TR01',
      partyAName: 'Chủ Nhà Trần Văn A',
      partyBName: 'Người Thuê Nguyễn Thị B',
      totalValue: 4500000,
      contentHtml: '<p>Hai bên đồng ý ký kết hợp đồng thuê phòng trọ số 204.</p>',
      signatures: [
        {
          partyRole: 'PARTY_A',
          signerName: 'Trần Văn A',
          signedAt: new Date(),
          signatureType: 'DRAWN'
        },
        {
          partyRole: 'PARTY_B',
          signerName: 'Nguyễn Thị B',
          signedAt: new Date(),
          signatureType: 'TYPED'
        }
      ]
    });

    expect(Buffer.isBuffer(docxBuffer)).toBe(true);
    expect(docxBuffer.length).toBeGreaterThan(500); // Valid zip archive for .docx
  });
});

describe('Temporary Account Lifecycle & Validation', () => {
  it('should generate standardized temporary identifier', () => {
    const id = generateTemporaryIdentifier('TMP');
    expect(id).toMatch(/^TMP-\d{6}-[A-Z0-9]{4}$/);
  });

  it('should generate standardized 6-character activation code', () => {
    const code = generateActivationCode();
    expect(code).toMatch(/^ACT-[A-Z0-9]{6}$/);
  });

  it('should correctly evaluate temporary account validity state machine', () => {
    const now = new Date();
    const future = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const past = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Active and not expired
    expect(
      isTemporaryAccountValid({
        status: 'ACTIVE_TEMPORARY',
        expiresAt: future
      })
    ).toBe(true);

    // Pending activation
    expect(
      isTemporaryAccountValid({
        status: 'PENDING_ACTIVATION',
        expiresAt: future
      })
    ).toBe(true);

    // Expired by date
    expect(
      isTemporaryAccountValid({
        status: 'ACTIVE_TEMPORARY',
        expiresAt: past
      })
    ).toBe(false);

    // Claimed
    expect(
      isTemporaryAccountValid({
        status: 'CLAIMED',
        expiresAt: future
      })
    ).toBe(false);

    // Revoked
    expect(
      isTemporaryAccountValid({
        status: 'REVOKED',
        expiresAt: future
      })
    ).toBe(false);
  });
});

describe('OCR Pipeline & Vietnamese Entity Extraction', () => {
  it('should accurately extract Vietnamese contract fields', () => {
    const rawOcrText = `
CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
HỢP ĐỒNG THUÊ NHÀ Ở VÀ DỊCH VỤ PHÒNG TRỌ
Số: HĐ-2026/TR-P302

BÊN THUÊ (BÊN B):
Ông/Bà: Nguyễn Văn Toàn
Số CCCD: 001098012345
Số điện thoại: 0987654321
Hai bên thống nhất ký kết hợp đồng thuê phòng trọ số 302:
1. Giá thuê phòng: 3.800.000 đ/tháng.
2. Tiền đặt cọc bảo đảm: 3.800.000 đ.
    `;

    const entities = extractVietnameseContractEntities(rawOcrText);

    expect(entities.partyBName).toBe('Nguyễn Văn Toàn');
    expect(entities.citizenId).toBe('001098012345');
    expect(entities.partyBPhone).toBe('0987654321');
    expect(entities.roomNumber).toBe('302');
    expect(entities.rentAmount).toBe(3800000);
    expect(entities.depositAmount).toBe(3800000);
  });

  it('should classify document templates properly', () => {
    expect(classifyContractDocument('Hợp đồng thuê phòng trọ số 101')).toBe('RENTAL');
    expect(classifyContractDocument('Thỏa thuận khóa học tiếng Anh giao tiếp')).toBe('EDUCATION');
    expect(classifyContractDocument('Thỏa thuận hội viên CLB Pickleball')).toBe('SPORTS');
    expect(classifyContractDocument('Biên bản bàn giao thiết bị')).toBe('GENERAL');
  });
});
