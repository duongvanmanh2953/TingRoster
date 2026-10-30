import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { ChatService } from '@/server/services/chat.service';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  // Verify group membership
  const auth = await ChatService.verifyMembership(params.id, userId);
  if (!auth.allowed) {
    return NextResponse.json({ success: false, error: auth.reason || 'Không có quyền tải lên' }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy tệp đính kèm' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({
        success: false,
        error: 'Định dạng tệp không được hỗ trợ. Chỉ chấp nhận ảnh (JPG, PNG, WebP, GIF) và tài liệu (PDF, Word, Excel, TXT)',
      }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        success: false,
        error: 'Dung lượng tệp vượt quá giới hạn 10MB',
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeExt = path.extname(file.name) || '.bin';
    const uniqueName = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}${safeExt}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'chat');

    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, uniqueName);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/chat/${uniqueName}`;

    return NextResponse.json({
      success: true,
      data: {
        fileName: file.name,
        fileUrl,
        fileType: file.type,
        fileSize: file.size,
      },
    });
  } catch (err: any) {
    console.error('Chat upload error:', err);
    return NextResponse.json({ success: false, error: 'Lỗi trong quá trình lưu trữ tệp đính kèm' }, { status: 500 });
  }
}
