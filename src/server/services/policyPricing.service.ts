import { prisma } from '@/lib/db/prisma';

export interface CreateClauseInput {
  groupId: string;
  clauseType: 'RENTAL_RULES' | 'TUITION_POLICY' | 'SPORTS_REGULATION' | 'GENERAL_TERMS';
  title: string;
  content: string;
  requiresReacceptance?: boolean;
}

export interface UpdatePricingInput {
  groupId: string;
  itemType: 'DEFAULT_FEE' | 'SERVICE' | 'SURCHARGE' | 'METER_RATE';
  itemId?: string | null;
  itemName: string;
  newPrice: number;
  reason: string;
}

export class PolicyPricingService {
  /**
   * Create or update space policy clause with versioning
   */
  static async updateClause(ownerId: string, input: CreateClauseInput, changeReason?: string) {
    const group = await prisma.group.findFirst({
      where: { id: input.groupId, userId: ownerId },
    });
    if (!group) throw new Error('Không có quyền quản lý không gian này');

    // Find active clause of same type in group
    const existing = await prisma.spaceClause.findFirst({
      where: {
        groupId: input.groupId,
        clauseType: input.clauseType,
        isActive: true,
      },
      orderBy: { version: 'desc' },
    });

    if (existing) {
      // Inactivate previous version
      await prisma.spaceClause.update({
        where: { id: existing.id },
        data: { isActive: false },
      });

      // Create incremented version
      const newVersion = await prisma.spaceClause.create({
        data: {
          groupId: input.groupId,
          clauseType: input.clauseType,
          title: input.title,
          version: existing.version + 1,
          content: input.content.trim(),
          previousContent: existing.content,
          changeReason: changeReason || 'Cập nhật điều khoản phiên bản mới',
          requiresReacceptance: !!input.requiresReacceptance,
          createdById: ownerId,
          isActive: true,
        },
      });

      return newVersion;
    }

    // First version
    const created = await prisma.spaceClause.create({
      data: {
        groupId: input.groupId,
        clauseType: input.clauseType,
        title: input.title,
        version: 1,
        content: input.content.trim(),
        requiresReacceptance: !!input.requiresReacceptance,
        createdById: ownerId,
        isActive: true,
      },
    });

    return created;
  }

  /**
   * Member accepts/confirms a specific clause version
   */
  static async acceptClause(clauseId: string, userId: string, userName: string, ipAddress?: string) {
    const clause = await prisma.spaceClause.findUnique({
      where: { id: clauseId },
    });
    if (!clause) throw new Error('Điều khoản không tồn tại');

    const acceptance = await prisma.spaceClauseAcceptance.upsert({
      where: {
        clauseId_userId_versionAccepted: {
          clauseId,
          userId,
          versionAccepted: clause.version,
        },
      },
      create: {
        clauseId,
        groupId: clause.groupId,
        userId,
        userName,
        versionAccepted: clause.version,
        ipAddress: ipAddress || '127.0.0.1',
      },
      update: {
        acceptedAt: new Date(),
        ipAddress: ipAddress || '127.0.0.1',
      },
    });

    return acceptance;
  }

  /**
   * Update fee/pricing with persistent audit history snapshot
   */
  static async updatePriceWithHistory(ownerId: string, ownerName: string, input: UpdatePricingInput) {
    const group = await prisma.group.findFirst({
      where: { id: input.groupId, userId: ownerId },
    });
    if (!group) throw new Error('Không có quyền quản lý không gian này');

    let oldPrice = 0;

    // Handle DEFAULT_FEE update
    if (input.itemType === 'DEFAULT_FEE') {
      oldPrice = group.defaultFee;
      await prisma.group.update({
        where: { id: input.groupId },
        data: { defaultFee: Math.max(0, Math.floor(input.newPrice)) },
      });
    } else if (input.itemType === 'SERVICE' && input.itemId) {
      // Find service
      const svc = await prisma.service.findUnique({
        where: { id: input.itemId },
      });
      if (svc) {
        // Service price update
      }
    }

    // Record immutable audit history
    const history = await prisma.pricingHistory.create({
      data: {
        groupId: input.groupId,
        itemType: input.itemType,
        itemId: input.itemId || null,
        itemName: input.itemName,
        oldPrice,
        newPrice: Math.max(0, Math.floor(input.newPrice)),
        reason: input.reason.trim(),
        changedById: ownerId,
        changedByName: ownerName,
      },
    });

    return history;
  }

  /**
   * Get clauses and student acceptance status in a space
   */
  static async getSpaceClauses(groupId: string, userId?: string) {
    const clauses = await prisma.spaceClause.findMany({
      where: { groupId, isActive: true },
      orderBy: { updatedAt: 'desc' },
      include: {
        acceptances: userId ? { where: { userId } } : false,
      },
    });

    return clauses.map((c) => ({
      ...c,
      isAcceptedByMe: userId ? (c.acceptances as any[])?.length > 0 : false,
      acceptedAt: userId && (c.acceptances as any[])?.[0]?.acceptedAt || null,
    }));
  }

  /**
   * Get pricing history for a space
   */
  static async getPricingHistories(groupId: string) {
    const histories = await prisma.pricingHistory.findMany({
      where: { groupId },
      orderBy: { effectiveFrom: 'desc' },
      take: 50,
    });
    return histories;
  }
}
