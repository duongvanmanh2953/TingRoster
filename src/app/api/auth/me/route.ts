import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    data: session,
  });
}
