import { prisma } from '@/lib/db/prisma';
import { generateUniquePaymentCode } from '@/lib/reconciliation/payment-code';

export interface CreateSurchargeInput {
  memberId: string;
  title: string;
  category: 'PRE_AGREED' | 'NEW_INCIDENTAL' | 'INDEMNITY_VIOLATION';
  amount: number;
  reason: string;
  evidenceUrl?: string | null;
  clauseReference?: string | null;
  status?: string;
}

export class SurchargeService {
  /**
   * Create a surcharge / indemnity proposal
   */
  static async createProposal(groupId: string, userId: string, input: CreateSurchargeInput) {
    const group = await prisma.group.findFirst({
      where: { id: groupId, userId },
      include: { user: { select: { name: true } } },
    });
    if (!group) throw new Error('Không tìm thấy không gian quản lý');

    const member = await prisma.member.findFirst({
      where: { id: input.memberId, groupId },
    });
    if (!member) throw new Error('Không tìm thấy thành viên trong không gian');

    if (!input.title?.trim()) throw new Error('Tiêu đề phụ thu không được để trống');
    if (input.amount <= 0) throw new Error('Số tiền phụ thu phải lớn hơn 0');
    if (!input.reason?.trim()) throw new Error('Lý do phụ thu / bồi hoàn phải được giải trình rõ ràng');

    // If pre-agreed by prior contract terms, status can start as ACCEPTED or PROPOSED
    const initialStatus = input.category === 'PRE_AGREED' ? 'ACCEPTED' : (input.status || 'PROPOSED');

    const proposal = await prisma.surchargeProposal.create({
      data: {
        groupId,
        memberId: input.memberId,
        title: input.title.trim(),
        category: input.category,
        amount: Math.round(input.amount),
        reason: input.reason.trim(),
        evidenceUrl: input.evidenceUrl || null,
        clauseReference: input.clauseReference || null,
        status: initialStatus,
        proposedById: userId,
        proposedByName: group.user.name,
      },
      include: {
        member: { select: { id: true, name: true, phone: true } },
      },
    });

    return proposal;
  }

  /**
   * Get surcharges for space
   */
  static async getSpaceSurcharges(groupId: string, userId: string, status?: string) {
    const group = await prisma.group.findFirst({
      where: { id: groupId, userId },
    });
    if (!group) throw new Error('Không có quyền truy cập');

    const whereClause: Record<string, unknown> = { groupId };
    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    return prisma.surchargeProposal.findMany({
      where: whereClause,
      include: {
        member: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Member/Student responds (Accept or Dispute)
   */
  static async memberRespond(
    surchargeId: string,
    userId: string,
    action: 'ACCEPT' | 'REJECT' | 'DISPUTE',
    responseNote?: string
  ) {
    const surcharge = await prisma.surchargeProposal.findUnique({
      where: { id: surchargeId },
      include: { member: true },
    });

    if (!surcharge) throw new Error('Khoản phụ thu không tồn tại');

    // Verify member belongs to this user or matches
    if (surcharge.member.userId && surcharge.member.userId !== userId) {
      throw new Error('Bạn không có quyền phản hồi khoản phụ thu này');
    }

    if (surcharge.status === 'ACCEPTED' && surcharge.invoicedAt) {
      throw new Error('Khoản phụ thu này đã được xác nhận và xuất hóa đơn');
    }

    let newStatus = 'WAITING_FOR_PARTY_B';
    if (action === 'ACCEPT') newStatus = 'ACCEPTED';
    if (action === 'REJECT') newStatus = 'REJECTED';
    if (action === 'DISPUTE') newStatus = 'DISPUTED';

    const updated = await prisma.surchargeProposal.update({
      where: { id: surchargeId },
      data: {
        status: newStatus,
        responseNote: responseNote?.trim() || null,
        respondedAt: new Date(),
      },
      include: {
        member: { select: { id: true, name: true, phone: true } },
      },
    });

    return updated;
  }

  /**
   * Convert an accepted surcharge into an invoice
   * CRITICAL BUSINESS RULE: Surcharges that are DISPUTED, PROPOSED, or REJECTED can NEVER be converted into an invoice!
   */
  static async convertToInvoice(surchargeId: string, userId: string) {
    const surcharge = await prisma.surchargeProposal.findUnique({
      where: { id: surchargeId },
      include: {
        group: true,
        member: true,
      },
    });

    if (!surcharge) throw new Error('Khoản phụ thu không tồn tại');
    if (surcharge.group.userId !== userId) throw new Error('Không có quyền thao tác');

    if (surcharge.invoicedAt && surcharge.invoiceId) {
      throw new Error('Khoản phụ thu này đã được chuyển thành hóa đơn trước đó');
    }

    if (surcharge.status !== 'ACCEPTED') {
      throw new Error(
        `Không thể xuất hóa đơn cho khoản phụ thu đang ở trạng thái "${surcharge.status}". Khoản phụ thu mới phải được bên còn lại đồng ý (ACCEPTED).`
      );
    }

    const paymentCode = await generateUniquePaymentCode();
    const dueDate = new Date(Date.now() + 7 * 86400000);

    const invoice = await prisma.$transaction(async (tx) => {
      const inv = await tx.invoice.create({
        data: {
          userId,
          groupId: surcharge.groupId,
          memberId: surcharge.memberId,
          title: `[Phụ thu đã xác nhận] ${surcharge.title}`,
          amountDue: surcharge.amount,
          amountPaid: 0,
          paymentCode,
          dueDate,
          status: 'UNPAID',
          metadata: JSON.stringify({
            source: 'SURCHARGE_ACCEPTANCE',
            surchargeId: surcharge.id,
            category: surcharge.category,
            clauseReference: surcharge.clauseReference,
          }),
          lineItems: {
            create: [
              {
                title: surcharge.title,
                quantity: 1,
                unit: 'lần',
                unitPrice: surcharge.amount,
                amount: surcharge.amount,
                metadata: JSON.stringify({ reason: surcharge.reason, evidenceUrl: surcharge.evidenceUrl }),
              },
            ],
          },
        },
      });

      await tx.surchargeProposal.update({
        where: { id: surcharge.id },
        data: {
          invoicedAt: new Date(),
          invoiceId: inv.id,
        },
      });

      return inv;
    });

    return invoice;
  }
}
