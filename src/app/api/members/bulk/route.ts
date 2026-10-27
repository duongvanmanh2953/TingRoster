import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { LedgerType } from '@prisma/client';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const BulkImportSchema = z.object({
  groupId: z.string().min(1, 'Thiếu nhóm học viên'),
  fileName: z.string().default('ai_ocr_import.xlsx'),
  members: z.array(
    z.object({
      name: z.string().min(1, 'Tên không được để trống'),
      phone: z.string().optional().nullable(),
      parentName: z.string().optional().nullable(),
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { serviceBalance: true },
    });

    const currentBalance = user?.serviceBalance ?? 100000;
    const ocrCost = 500; // 500đ / lần trích xuất AI OCR
    const newBalance = Math.max(0, currentBalance - ocrCost);

    // Atomic transaction: create members, deduct wallet, record ledger, record import job
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create members
      const createdMembers = await Promise.all(
        parsed.members.map((m) =>
          tx.member.create({
            data: {
              groupId: parsed.groupId,
              name: m.name.trim(),
              phone: m.phone?.trim() || null,
              parentName: m.parentName?.trim() || null,
            },
          })
        )
      );

      // 2. Update service balance
      await tx.user.update({
        where: { id: userId },
        data: { serviceBalance: newBalance },
      });

      // 3. Create wallet ledger entry
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

      // 4. Create AiImportJob
      const job = await tx.aiImportJob.create({
        data: {
          userId,
          fileName: parsed.fileName,
          fileType: parsed.fileName.endsWith('.csv') ? 'CSV' : parsed.fileName.endsWith('.xlsx') ? 'EXCEL' : 'IMAGE',
          extractedCount: parsed.members.length,
          confidenceScore: 97,
          rawResult: JSON.stringify(parsed.members),
          targetGroupId: parsed.groupId,
          status: 'COMPLETED',
        },
      });

      return {
        importedCount: createdMembers.length,
        groupName: group.name,
        jobId: job.id,
        balanceAfter: newBalance,
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
