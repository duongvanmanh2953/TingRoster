import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { LedgerType } from '@prisma/client';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const BulkImportSchema = z.object({
  groupId: z.string().min(1, 'Thiếu nhóm học viên'),
  fileName: z.string().default('excel_import.xlsx'),
  action: z.enum(['PREVIEW', 'COMMIT']).default('COMMIT'),
  isAiOcr: z.boolean().default(false),
  members: z.array(
    z.object({
      name: z.string().min(1, 'Tên không được để trống'),
      phone: z.string().optional().nullable(),
      parentName: z.string().optional().nullable(),
      note: z.string().optional().nullable(),
    })
  ).min(1, 'Danh sách học viên rỗng'),
});

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = BulkImportSchema.parse(body);

    const group = await prisma.group.findFirst({
      where: { id: parsed.groupId, userId },
      select: { id: true, name: true },
    });

    if (!group) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy nhóm học viên' }, { status: 404 });
    }

    // Query existing members in this group to identify duplicates
    const existingMembers = await prisma.member.findMany({
      where: { groupId: parsed.groupId },
      select: { id: true, name: true, phone: true },
    });

    const existingPhones = new Set(
      existingMembers.map((m) => m.phone).filter((p): p is string => Boolean(p))
    );
    const existingNames = new Set(existingMembers.map((m) => m.name.toLowerCase().trim()));

    // Analyze rows for duplicate detection
    const seenBatchPhones = new Set<string>();
    const analyzedRows = parsed.members.map((m, idx) => {
      const trimmedName = m.name.trim();
      const trimmedPhone = m.phone?.trim() || null;
      const issues: string[] = [];

      if (!trimmedName || trimmedName.length < 2) {
        issues.push('Tên học viên quá ngắn hoặc để trống');
      }

      let isDuplicate = false;
      if (trimmedPhone) {
        if (existingPhones.has(trimmedPhone)) {
          isDuplicate = true;
          issues.push(`Số điện thoại ${trimmedPhone} đã tồn tại trong nhóm`);
        } else if (seenBatchPhones.has(trimmedPhone)) {
          isDuplicate = true;
          issues.push(`Số điện thoại ${trimmedPhone} trùng lặp trong file tải lên`);
        } else {
          seenBatchPhones.add(trimmedPhone);
        }
      } else if (existingNames.has(trimmedName.toLowerCase())) {
        isDuplicate = true;
        issues.push(`Học viên tên "${trimmedName}" đã có trong nhóm`);
      }

      return {
        index: idx + 1,
        name: trimmedName,
        phone: trimmedPhone,
        parentName: m.parentName?.trim() || null,
        note: m.note?.trim() || null,
        isValid: issues.length === 0,
        isDuplicate,
        errors: issues,
      };
    });

    const validRows = analyzedRows.filter((r) => r.isValid);
    const duplicateRows = analyzedRows.filter((r) => r.isDuplicate);
    const errorRows = analyzedRows.filter((r) => !r.isValid && !r.isDuplicate);

    // If PREVIEW mode: do not mutate database, return validated report
    if (parsed.action === 'PREVIEW') {
      return NextResponse.json({
        success: true,
        data: {
          action: 'PREVIEW',
          groupName: group.name,
          totalCount: analyzedRows.length,
          validCount: validRows.length,
          duplicateCount: duplicateRows.length,
          errorCount: errorRows.length,
          estimatedCost: parsed.isAiOcr ? 500 : 0,
          rows: analyzedRows,
        },
      });
    }

    // COMMIT mode: Idempotently insert valid rows
    if (validRows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Không có học viên hợp lệ nào để nhập (tất cả đều lỗi hoặc đã tồn tại)',
      }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { serviceBalance: true },
    });

    const currentBalance = user?.serviceBalance ?? 100000;
    // Standard Excel is FREE (0đ). Only AI OCR charges 500đ.
    const ocrCost = parsed.isAiOcr ? 500 : 0;
    const newBalance = Math.max(0, currentBalance - ocrCost);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create members
      const createdMembers = await Promise.all(
        validRows.map((m) =>
          tx.member.create({
            data: {
              groupId: parsed.groupId,
              name: m.name,
              phone: m.phone,
              parentName: m.parentName,
            },
          })
        )
      );

      // 2. Only if AI OCR: deduct wallet and record ledger
      if (ocrCost > 0) {
        await tx.user.update({
          where: { id: userId },
          data: { serviceBalance: newBalance },
        });

        await tx.walletLedgerEntry.create({
          data: {
            userId,
            amount: -ocrCost,
            balanceAfter: newBalance,
            type: LedgerType.USAGE_AI_OCR,
            description: `Phí AI OCR trích xuất danh sách: ${parsed.fileName} (${parsed.members.length} thành viên)`,
            metadata: JSON.stringify({ groupId: parsed.groupId, count: parsed.members.length }),
          },
        });
      }

      // 3. Create AiImportJob record for audit history
      const job = await tx.aiImportJob.create({
        data: {
          userId,
          fileName: parsed.fileName,
          fileType: parsed.fileName.endsWith('.csv') ? 'CSV' : 'EXCEL',
          extractedCount: parsed.members.length,
          confidenceScore: 100,
          rawResult: JSON.stringify(validRows.map((r) => ({ name: r.name, phone: r.phone }))),
          targetGroupId: parsed.groupId,
          status: 'COMPLETED',
        },
      });

      return {
        importedCount: createdMembers.length,
        skippedCount: duplicateRows.length + errorRows.length,
        groupName: group.name,
        jobId: job.id,
        balanceAfter: newBalance,
        createdMembers: createdMembers.map((m) => ({
          id: m.id,
          name: m.name,
          phone: m.phone,
          code: `TR-MEMBER-${m.id.slice(-6).toUpperCase()}`,
        })),
      };
    });

    return NextResponse.json({
      success: true,
      message: `Đã nhập thành công ${result.importedCount} học viên vào lớp ${result.groupName}`,
      data: result,
    });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0]?.message }, { status: 400 });
    }
    console.error('Bulk import error:', err);
    return NextResponse.json({ success: false, error: 'Lỗi khi nhập danh sách' }, { status: 500 });
  }
}
