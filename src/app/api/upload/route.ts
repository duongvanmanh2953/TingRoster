import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
const MAX_FILE_SIZE_BYTES = 3 * 1024 * 1024; // 3MB

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'Vui lòng chọn file hình ảnh' }, { status: 400 });
    }

    // 1. Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({
        success: false,
        error: 'Dung lượng file tối đa là 3MB',
      }, { status: 400 });
    }

    // 2. Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({
        success: false,
        error: 'Chỉ chấp nhận các định dạng ảnh: PNG, JPG, WEBP, SVG',
      }, { status: 400 });
    }

    // 3. Determine file extension
    let ext = '.png';
    if (file.type === 'image/jpeg' || file.type === 'image/jpg') ext = '.jpg';
    else if (file.type === 'image/webp') ext = '.webp';
    else if (file.type === 'image/svg+xml') ext = '.svg';
    else if (file.name.includes('.')) {
      ext = `.${file.name.split('.').pop()?.toLowerCase() || 'png'}`;
    }

    // 4. Safe filename
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const filename = `logo-${uniqueId}${ext}`;

    // 5. Ensure directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'logos');
    await fs.mkdir(uploadsDir, { recursive: true });

    // 6. Write buffer to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(uploadsDir, filename);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/logos/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      size: file.size,
      mimeType: file.type,
    });
  } catch (err: unknown) {
    console.error('File upload error:', err);
    return NextResponse.json({ success: false, error: 'Lỗi trong quá trình tải file lên' }, { status: 500 });
  }
}
