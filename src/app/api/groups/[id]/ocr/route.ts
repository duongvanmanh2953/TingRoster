import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { OcrDocumentService } from '@/server/services/ocrDocument.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const jobs = await OcrDocumentService.getOcrJobs(params.id);
    return NextResponse.json({ success: true, data: jobs });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Lỗi tải hồ sơ scan' }, { status: 400 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });

  try {
    const body = await req.json();
    const result = await OcrDocumentService.createOcrJob(params.id, userId, {
      fileName: body.fileName || 'scanned_contract.png',
      fileUrl: body.fileUrl || '/uploads/chat/sample_scan.png',
      fileType: body.fileType || 'image/png',
      simulatedRawText: body.rawText,
    });
    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Lỗi xử lý OCR tài liệu' }, { status: 400 });
  }
}
