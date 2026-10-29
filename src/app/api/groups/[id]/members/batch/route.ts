import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

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

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const currentUserId = getUserIdFromRequest(req);
  if (!currentUserId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  const groupId = params.id;

  try {
    // 1. Verify group ownership
    const group = await prisma.group.findFirst({
      where: { id: groupId, userId: currentUserId },
      select: { id: true, name: true },
    });

    if (!group) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy nhóm hoặc bạn không có quyền' }, { status: 404 });
    }

    const body = await req.json();
    const parsed = BatchAddMembersSchema.parse(body);

    const results: Array<{ id: string; name: string; status: 'ADDED' | 'REACTIVATED' | 'SKIPPED'; reason?: string }> = [];

    await prisma.$transaction(async (tx) => {
      for (const m of parsed.members) {
        // Check if member already enrolled by userId or phone
        const existing = await tx.member.findFirst({
          where: {
            groupId,
            OR: [
              ...(m.userId ? [{ userId: m.userId }] : []),
              ...(m.phone ? [{ phone: m.phone }] : []),
              { name: m.name.trim() },
            ],
          },
        });

        if (existing) {
          if (existing.status === 'ACTIVE') {
            results.push({
              id: existing.id,
              name: existing.name,
              status: 'SKIPPED',
              reason: 'Đã có trong danh sách nhóm',
            });
            continue;
          } else {
            // Reactivate inactive member
            const reactivated = await tx.member.update({
              where: { id: existing.id },
              data: {
                status: 'ACTIVE',
                userId: m.userId || existing.userId,
                avatarUrl: m.avatarUrl || existing.avatarUrl,
              },
            });
            results.push({
              id: reactivated.id,
              name: reactivated.name,
              status: 'REACTIVATED',
            });
            continue;
          }
        }

        // Create new member
        const created = await tx.member.create({
          data: {
            groupId,
            userId: m.userId || null,
            name: m.name.trim(),
            phone: m.phone?.trim() || null,
            parentName: m.parentName?.trim() || null,
            avatarUrl: m.avatarUrl || null,
            gender: m.gender || 'OTHER',
            ageGroup: m.ageGroup || 'TEEN',
            status: 'ACTIVE',
          },
        });

        results.push({
          id: created.id,
          name: created.name,
          status: 'ADDED',
        });
      }

      // Record Audit Log
      await tx.auditLog.create({
        data: {
          userId: currentUserId,
          action: 'BATCH_ADD_GROUP_MEMBERS',
          entityType: 'Group',
          entityId: groupId,
          details: JSON.stringify({
            groupName: group.name,
            totalRequested: parsed.members.length,
            added: results.filter((r) => r.status === 'ADDED' || r.status === 'REACTIVATED').length,
            skipped: results.filter((r) => r.status === 'SKIPPED').length,
          }),
        },
      });
    });

    const addedCount = results.filter((r) => r.status === 'ADDED' || r.status === 'REACTIVATED').length;
    const skippedCount = results.filter((r) => r.status === 'SKIPPED').length;

    return NextResponse.json({
      success: true,
      data: {
        addedCount,
        skippedCount,
        totalRequested: parsed.members.length,
        results,
      },
    }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0]?.message }, { status: 400 });
    }
    console.error('Batch add members error:', err);
    return NextResponse.json({ success: false, error: 'Lỗi trong quá trình thêm thành viên hàng loạt' }, { status: 500 });
  }
}
