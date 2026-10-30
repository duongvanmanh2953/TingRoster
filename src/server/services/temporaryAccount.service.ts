import { prisma } from '@/lib/db/prisma';
import crypto from 'crypto';

export interface CreateTempAccountInput {
  groupId: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  validDays?: number;
  notes?: string | null;
}

export class TemporaryAccountService {
  /**
   * Generate an identifier e.g. "TR-TEMP-849201"
   */
  static generateIdentifier(): string {
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `TR-TEMP-${rand}`;
  }

  /**
   * Generate 6-digit activation code e.g. "ACT-481920"
   */
  static generateActivationCode(): string {
    const num = Math.floor(100000 + Math.random() * 900000);
    return `ACT-${num}`;
  }

  /**
   * Create a single temporary account for a student/tenant
   */
  static async createTemporaryAccount(groupId: string, ownerId: string, input: CreateTempAccountInput) {
    // Verify space ownership
    const group = await prisma.group.findFirst({
      where: { id: groupId, userId: ownerId },
    });
    if (!group) throw new Error('Không có quyền quản lý không gian này');

    const identifier = this.generateIdentifier();
    const activationCode = this.generateActivationCode();
    const activationToken = `tr_temp_${crypto.randomBytes(24).toString('hex')}`;
    const validDays = input.validDays || 30;
    const expiresAt = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000);

    const tempAccount = await prisma.$transaction(async (tx) => {
      // 1. Create temporary account record
      const temp = await tx.temporaryAccount.create({
        data: {
          identifier,
          name: input.name.trim(),
          phone: input.phone?.trim() || null,
          email: input.email?.trim() || null,
          groupId,
          ownerId,
          status: 'PENDING_ACTIVATION',
          activationCode,
          activationToken,
          expiresAt,
          notes: input.notes || null,
        },
      });

      // 2. Pre-create or link active Member record in the space so attendance & billing can work immediately
      await tx.member.create({
        data: {
          groupId,
          name: input.name.trim(),
          phone: input.phone?.trim() || null,
          status: 'ACTIVE',
        },
      });

      return temp;
    });

    return tempAccount;
  }

  /**
   * Batch create temporary accounts (e.g. from imported roster)
   */
  static async createBatchTemporaryAccounts(
    groupId: string,
    ownerId: string,
    list: Array<{ name: string; phone?: string; email?: string; notes?: string }>
  ) {
    const results = [];
    for (const item of list) {
      if (item.name && item.name.trim()) {
        const created = await this.createTemporaryAccount(groupId, ownerId, {
          groupId,
          name: item.name,
          phone: item.phone,
          email: item.email,
          notes: item.notes,
        });
        results.push(created);
      }
    }
    return results;
  }

  /**
   * Resolve temporary account by code or token
   */
  static async resolveAccount(codeOrToken: string) {
    const clean = codeOrToken.trim();

    const account = await prisma.temporaryAccount.findFirst({
      where: {
        OR: [
          { activationCode: clean },
          { activationToken: clean },
        ],
      },
      include: {
        group: { select: { id: true, name: true, slug: true, logoUrl: true, defaultFee: true } },
      },
    });

    if (!account) {
      return { found: false, error: 'Mã kích hoạt hoặc liên kết không tồn tại' };
    }

    const isExpired = new Date() > new Date(account.expiresAt);
    const isClaimed = account.status === 'CLAIMED';
    const isRevoked = account.status === 'REVOKED';

    return {
      found: true,
      account,
      isExpired,
      isClaimed,
      isRevoked,
      canClaim: !isExpired && !isClaimed && !isRevoked,
    };
  }

  /**
   * Claim temporary account by registered user
   */
  static async claimTemporaryAccount(codeOrToken: string, claimingUserId: string) {
    const resolved = await this.resolveAccount(codeOrToken);
    if (!resolved.found || !resolved.account) {
      throw new Error(resolved.error || 'Tài khoản tạm không hợp lệ');
    }

    if (!resolved.canClaim) {
      if (resolved.isClaimed) throw new Error('Tài khoản tạm này đã được nhận và kích hoạt trước đó');
      if (resolved.isExpired) throw new Error('Mã kích hoạt đã hết hạn sử dụng. Vui lòng liên hệ Giáo viên/Quản lý để gia hạn.');
      if (resolved.isRevoked) throw new Error('Tài khoản tạm này đã bị thu hồi bởi Quản lý.');
      throw new Error('Không thể tiếp nhận tài khoản tạm thời này');
    }

    const account = resolved.account;

    // Execute atomic claim
    const claimed = await prisma.$transaction(async (tx) => {
      // 1. Mark account as CLAIMED
      const updatedAccount = await tx.temporaryAccount.update({
        where: { id: account.id },
        data: {
          status: 'CLAIMED',
          claimedUserId: claimingUserId,
          claimedAt: new Date(),
        },
      });

      // 2. Link member record in space to the claiming user
      // Find unlinked member matching name or phone in this group
      const existingMember = await tx.member.findFirst({
        where: {
          groupId: account.groupId,
          name: account.name,
          userId: null,
        },
      });

      if (existingMember) {
        await tx.member.update({
          where: { id: existingMember.id },
          data: { userId: claimingUserId, status: 'ACTIVE' },
        });
      } else {
        // Ensure user has active member profile
        await tx.member.create({
          data: {
            groupId: account.groupId,
            userId: claimingUserId,
            name: account.name,
            phone: account.phone,
            status: 'ACTIVE',
          },
        });
      }

      return updatedAccount;
    });

    return claimed;
  }

  /**
   * Renew / Extend expiration of temporary account
   */
  static async renewTemporaryAccount(accountId: string, ownerId: string, additionalDays = 30) {
    const account = await prisma.temporaryAccount.findFirst({
      where: { id: accountId, ownerId },
    });

    if (!account) throw new Error('Tài khoản tạm không tồn tại');

    const baseDate = new Date(account.expiresAt) > new Date() ? new Date(account.expiresAt) : new Date();
    const newExpiresAt = new Date(baseDate.getTime() + additionalDays * 24 * 60 * 60 * 1000);

    const updated = await prisma.temporaryAccount.update({
      where: { id: accountId },
      data: {
        expiresAt: newExpiresAt,
        status: account.status === 'EXPIRED' ? 'PENDING_ACTIVATION' : account.status,
        renewalCount: { increment: 1 },
      },
    });

    return updated;
  }

  /**
   * Revoke temporary account
   */
  static async revokeTemporaryAccount(accountId: string, ownerId: string, reason?: string) {
    const account = await prisma.temporaryAccount.findFirst({
      where: { id: accountId, ownerId },
    });

    if (!account) throw new Error('Tài khoản tạm không tồn tại');

    const updated = await prisma.temporaryAccount.update({
      where: { id: accountId },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
        revokedReason: reason || 'Thu hồi bởi quản trị viên',
      },
    });

    return updated;
  }

  /**
   * Get space temporary accounts
   */
  static async getSpaceTemporaryAccounts(groupId: string, ownerId: string) {
    const group = await prisma.group.findFirst({
      where: { id: groupId, userId: ownerId },
    });
    if (!group) throw new Error('Không có quyền quản trị không gian');

    const accounts = await prisma.temporaryAccount.findMany({
      where: { groupId },
      orderBy: { createdAt: 'desc' },
      include: {
        claimedUser: { select: { id: true, name: true, email: true } },
      },
    });

    // Compute live status
    const now = new Date();
    const formatted = accounts.map((acc) => {
      let liveStatus = acc.status;
      if (acc.status === 'PENDING_ACTIVATION' && now > new Date(acc.expiresAt)) {
        liveStatus = 'EXPIRED';
      }
      return {
        ...acc,
        liveStatus,
      };
    });

    const stats = {
      total: accounts.length,
      claimed: accounts.filter((a) => a.status === 'CLAIMED').length,
      pending: accounts.filter((a) => a.status === 'PENDING_ACTIVATION' && now <= new Date(a.expiresAt)).length,
      expired: accounts.filter((a) => a.status === 'EXPIRED' || now > new Date(a.expiresAt)).length,
    };

    return { accounts: formatted, stats };
  }
}

export function generateTemporaryIdentifier(prefix = 'TMP'): string {
  const rand = Math.floor(100000 + Math.random() * 900000);
  const suffix = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${prefix}-${rand}-${suffix}`;
}

export function generateActivationCode(): string {
  return TemporaryAccountService.generateActivationCode();
}

export function isTemporaryAccountValid(account: { status: string; expiresAt: Date }): boolean {
  if (account.status !== 'ACTIVE_TEMPORARY' && account.status !== 'PENDING_ACTIVATION') {
    return false;
  }
  return new Date() <= new Date(account.expiresAt);
}
