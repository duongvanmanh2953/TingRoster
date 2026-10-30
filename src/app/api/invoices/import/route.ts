import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { generateUniquePaymentCode } from '@/lib/reconciliation/payment-code';
import { InvoiceStatus } from '@prisma/client';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const ImportRowSchema = z.object({
  refCode: z.string().optional().default(''),
  title: z.string().min(2, 'Tên khoản thu tối thiểu 2 ký tự'),
  memberName: z.string().min(1, 'Thiếu tên người nộp / học viên'),
  memberPhone: z.string().optional().default(''),
  groupName: z.string().min(1, 'Thiếu tên lớp / nhóm / cơ sở'),
  amountDue: z.number().int().positive('Số tiền phải là số nguyên dương'),
  dueDate: z.string().optional().default(''),
  note: z.string().optional().default(''),
});

const ImportPayloadSchema = z.object({
  rows: z.array(ImportRowSchema).min(1, 'Danh sách dữ liệu nhập rỗng'),
  dryRun: z.boolean().optional().default(false),
  groupId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }
  return NextResponse.json({
    success: true,
    message: 'Invoice Import API sẵn sàng. Gửi POST với { rows: [...], dryRun?: boolean, groupId?: string }',
  });
}

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { rows, dryRun, groupId } = ImportPayloadSchema.parse(body);

    // Limit maximum import rows per batch for safety
    if (rows.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Mỗi đợt nhập tối đa 500 dòng để đảm bảo tính toàn vẹn' },
        { status: 400 }
      );
    }

    // 1. Fetch user's existing groups and members
    const userGroups = await prisma.group.findMany({
      where: { userId, isActive: true },
      include: {
        members: { where: { status: 'ACTIVE' } },
      },
    });

    if (userGroups.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Bạn chưa tạo không gian làm việc (Lớp / CLB / Cơ sở) nào' },
        { status: 400 }
      );
    }

    // Build lookup maps for fast matching
    const groupByName = new Map<string, typeof userGroups[0]>();
    const groupById = new Map<string, typeof userGroups[0]>();
    for (const g of userGroups) {
      groupByName.set(g.name.trim().toLowerCase(), g);
      groupById.set(g.id, g);
    }

    const validatedRows: Array<{
      index: number;
      raw: z.infer<typeof ImportRowSchema>;
      isValid: boolean;
      errors: string[];
      targetGroupId?: string;
      targetMemberId?: string;
      targetMemberName?: string;
      targetGroupName?: string;
    }> = [];

    // Helper for normalized date
    const parseDueDate = (dateStr: string): Date => {
      if (!dateStr) {
        return new Date(Date.now() + 7 * 86400000); // 7 days from now
      }
      const parsed = new Date(dateStr);
      if (isNaN(parsed.getTime())) {
        return new Date(Date.now() + 7 * 86400000);
      }
      return parsed;
    };

    // 2. Validate each row against DB
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const errors: string[] = [];

      // Find matching group
      let matchedGroup = groupId ? groupById.get(groupId) : undefined;
      if (!matchedGroup && row.groupName) {
        matchedGroup = groupByName.get(row.groupName.trim().toLowerCase());
      }
      if (!matchedGroup) {
        // Fallback to first group if only 1 group exists
        if (userGroups.length === 1) {
          matchedGroup = userGroups[0];
        } else {
          errors.push(`Không tìm thấy lớp/nhóm "${row.groupName}"`);
        }
      }

      let matchedMemberId: string | undefined;
      let memberDisplayName = row.memberName;

      if (matchedGroup) {
        // Match member in that group by name or phone
        const normName = row.memberName.trim().toLowerCase();
        const normPhone = row.memberPhone ? row.memberPhone.trim().replace(/\D/g, '') : '';

        const foundMember = matchedGroup.members.find((m) => {
          const mNorm = m.name.trim().toLowerCase();
          const mPhone = m.phone ? m.phone.replace(/\D/g, '') : '';
          return mNorm === normName || (normPhone && mPhone && mPhone === normPhone);
        });

        if (foundMember) {
          matchedMemberId = foundMember.id;
          memberDisplayName = foundMember.name;
        } else {
          // If member not found in group, we can auto-create in commit phase or flag
          matchedMemberId = undefined;
        }
      }

      if (row.amountDue <= 0) {
        errors.push('Số tiền phải lớn hơn 0');
      }

      validatedRows.push({
        index: i + 1,
        raw: row,
        isValid: errors.length === 0,
        errors,
        targetGroupId: matchedGroup?.id,
        targetGroupName: matchedGroup?.name,
        targetMemberId: matchedMemberId,
        targetMemberName: memberDisplayName,
      });
    }

    const validRows = validatedRows.filter((r) => r.isValid);
    const errorRows = validatedRows.filter((r) => !r.isValid);

    // If dry run, return preview verification
    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        total: rows.length,
        validCount: validRows.length,
        errorCount: errorRows.length,
        preview: validatedRows,
      });
    }

    // 3. Commit Phase: Atomic transaction
    if (validRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Không có dòng dữ liệu hợp lệ nào để ghi nhận', details: errorRows },
        { status: 400 }
      );
    }

    const createdInvoices = await prisma.$transaction(async (tx) => {
      const results = [];

      for (const item of validRows) {
        const row = item.raw;
        let memberId = item.targetMemberId;

        // Auto-create member in group if not existed yet
        if (!memberId && item.targetGroupId) {
          const newMember = await tx.member.create({
            data: {
              groupId: item.targetGroupId,
              name: row.memberName.trim(),
              phone: row.memberPhone ? row.memberPhone.trim() : null,
              status: 'ACTIVE',
            },
          });
          memberId = newMember.id;
        }

        if (!memberId || !item.targetGroupId) continue;

        const paymentCode = await generateUniquePaymentCode();
        const dueDateTime = parseDueDate(row.dueDate);

        const metadataObj: Record<string, unknown> = {
          importSource: 'EXCEL_BATCH',
          importedAt: new Date().toISOString(),
        };
        if (row.refCode) metadataObj.refCode = row.refCode;
        if (row.note) metadataObj.note = row.note;

        const inv = await tx.invoice.create({
          data: {
            userId,
            groupId: item.targetGroupId,
            memberId,
            title: row.title.trim(),
            amountDue: row.amountDue,
            amountPaid: 0,
            paymentCode,
            status: InvoiceStatus.UNPAID,
            dueDate: dueDateTime,
            metadata: JSON.stringify(metadataObj),
          },
          include: {
            member: { select: { id: true, name: true, phone: true } },
            group: { select: { id: true, name: true } },
          },
        });

        results.push(inv);
      }

      // Record audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'INVOICE_EXCEL_IMPORT',
          entityType: 'INVOICE_BATCH',
          entityId: results[0]?.id || 'BATCH_IMPORT',
          details: `Nhập thành công ${results.length} khoản thu từ file Excel`,
          ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
        },
      });

      return results;
    });

    return NextResponse.json({
      success: true,
      dryRun: false,
      count: createdInvoices.length,
      totalAmount: createdInvoices.reduce((sum, inv) => sum + inv.amountDue, 0),
      data: createdInvoices,
    });
  } catch (err: any) {
    console.error('Invoice import error:', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: err.errors[0]?.message || 'Dữ liệu không đúng định dạng' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Không thể xử lý file nhập dữ liệu' },
      { status: 500 }
    );
  }
}
