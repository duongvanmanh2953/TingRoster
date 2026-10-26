import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

function cleanVietnamesePhone(raw: string): string {
  let cleaned = raw.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+84')) {
    cleaned = '0' + cleaned.slice(3);
  } else if (cleaned.startsWith('84') && cleaned.length === 11) {
    cleaned = '0' + cleaned.slice(2);
  }
  return cleaned;
}

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const { groupId, rawText } = await req.json();

    if (!groupId || !rawText) {
      return NextResponse.json({ success: false, error: 'Thiếu dữ liệu' }, { status: 400 });
    }

    // Verify user owns group
    const group = await prisma.group.findFirst({
      where: { id: groupId, userId },
      include: { members: { select: { name: true } } },
    });

    if (!group) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy nhóm' }, { status: 404 });
    }

    const existingNames = new Set(group.members.map((m) => m.name.toLowerCase().trim()));

    // Split lines
    const lines = rawText
      .split(/\r?\n/)
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0);

    const parsedMembers: Array<{
      name: string;
      phone: string;
      parentName?: string;
      isDuplicateInDb: boolean;
      status: 'VALID' | 'WARNING';
      message?: string;
    }> = [];

    const seenInBatch = new Set<string>();

    for (const line of lines) {
      // Split by tab, comma, or semicolon
      const parts = line.split(/[,\t;|]+/).map((p: string) => p.trim());

      let name = '';
      let phone = '';
      let parentName = '';

      // Heuristic column detection
      for (const p of parts) {
        if (!phone && /^(0|\+?84)?[0-9]{9,10}$/.test(p.replace(/[\s.-]/g, ''))) {
          phone = cleanVietnamesePhone(p);
        } else if (!name && p.length > 1 && !/^[0-9]+$/.test(p)) {
          name = p;
        } else if (!parentName && p.length > 1 && !/^[0-9]+$/.test(p)) {
          parentName = p;
        }
      }

      if (!name) continue;

      const normName = name.toLowerCase().trim();
      const isDuplicateInDb = existingNames.has(normName);
      const isDuplicateInBatch = seenInBatch.has(normName);
      seenInBatch.add(normName);

      let status: 'VALID' | 'WARNING' = 'VALID';
      let message = 'Hợp lệ';

      if (isDuplicateInDb) {
        status = 'WARNING';
        message = 'Đã có trong lớp';
      } else if (isDuplicateInBatch) {
        status = 'WARNING';
        message = 'Trùng lặp trong danh sách tải lên';
      }

      parsedMembers.push({
        name,
        phone,
        parentName: parentName || undefined,
        isDuplicateInDb,
        status,
        message,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        totalParsed: parsedMembers.length,
        validCount: parsedMembers.filter((m) => m.status === 'VALID').length,
        warningCount: parsedMembers.filter((m) => m.status === 'WARNING').length,
        members: parsedMembers,
      },
    });
  } catch (err) {
    console.error('AI import error:', err);
    return NextResponse.json({ success: false, error: 'Lỗi phân tích danh sách' }, { status: 500 });
  }
}
