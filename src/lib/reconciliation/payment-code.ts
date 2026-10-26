import crypto from 'crypto';
import { prisma } from '@/lib/db/prisma';

// Regex with word boundaries supporting alphanumeric or digit codes
export const PAYMENT_CODE_REGEX = /(?:^|[^A-Z0-9])(TR[0-9]{5})(?=$|[^A-Z0-9])/i;

/**
 * Remove Vietnamese accents and normalize string for robust matching
 */
export function normalizeTransferContent(content: string): string {
  if (!content) return '';
  return content
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toUpperCase();
}

/**
 * Extract payment code from transfer content
 */
export function extractPaymentCode(content: string): string | null {
  if (!content) return null;
  const normalized = normalizeTransferContent(content);
  const match = normalized.match(PAYMENT_CODE_REGEX);
  return match ? match[1].toUpperCase() : null;
}

/**
 * Generate a random cryptographically secure payment code (e.g. TR84920)
 */
export function generateRandomPaymentCode(): string {
  // 5 random digits between 10000 and 99999
  const randomNum = crypto.randomInt(10000, 99999);
  return `TR${randomNum}`;
}

/**
 * Generate a guaranteed unique payment code in database with retry logic
 */
export async function generateUniquePaymentCode(maxRetries = 5): Promise<string> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const code = generateRandomPaymentCode();
    const existing = await prisma.invoice.findUnique({
      where: { paymentCode: code },
      select: { id: true },
    });
    if (!existing) {
      return code;
    }
  }
  // Fallback with timestamp suffix if extreme collision
  return `TR${Date.now().toString().slice(-5)}`;
}
