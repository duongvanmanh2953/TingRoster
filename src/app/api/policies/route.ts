import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const policies = await prisma.policyDocument.findMany({
      orderBy: { policyType: 'asc' },
    });

    return NextResponse.json({ success: true, data: policies });
  } catch (err: unknown) {
    console.error('Fetch policies error:', err);
    return NextResponse.json({ success: false, error: 'Không thể tải điều khoản và chính sách' }, { status: 500 });
  }
}

const AcceptPolicySchema = z.object({
  policyId: z.string().min(1),
  version: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = AcceptPolicySchema.parse(body);

    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || '127.0.0.1';

    const acceptance = await prisma.policyAcceptance.upsert({
      where: {
        userId_policyId_version: {
          userId,
          policyId: parsed.policyId,
          version: parsed.version,
        },
      },
      update: {
        acceptedAt: new Date(),
        ipAddress: clientIp,
      },
      create: {
        userId,
        policyId: parsed.policyId,
        version: parsed.version,
        ipAddress: clientIp,
      },
    });

    return NextResponse.json({ success: true, data: acceptance });
  } catch (err: unknown) {
    console.error('Accept policy error:', err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Không thể ghi nhận đồng ý điều khoản' }, { status: 500 });
  }
}
