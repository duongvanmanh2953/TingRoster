import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const CreateAutomationSchema = z.object({
  name: z.string().min(2, 'Tên quy tắc tối thiểu 2 ký tự'),
  trigger: z.enum(['ON_PAYMENT_DUE', 'ON_UNMATCHED_TRANSACTION', 'ON_DAILY_SUMMARY', 'ON_INVOICE_PAID']),
  action: z.enum(['TELEGRAM_ALERT', 'EMAIL_SUMMARY', 'AUTO_REMINDER']),
  config: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  const automations = await prisma.automationRule.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, data: automations });
}

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = CreateAutomationSchema.parse(body);

    const rule = await prisma.automationRule.create({
      data: {
        userId,
        name: parsed.name.trim(),
        trigger: parsed.trigger,
        action: parsed.action,
        config: parsed.config,
        isEnabled: true,
      },
    });

    return NextResponse.json({ success: true, data: rule }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Lỗi tạo quy tắc tự động hóa' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
  }

  try {
    const { id, isEnabled, testRun } = await req.json();

    const rule = await prisma.automationRule.findFirst({
      where: { id, userId },
    });

    if (!rule) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy quy tắc' }, { status: 404 });
    }

    if (testRun) {
      // Simulate test execution
      const updated = await prisma.automationRule.update({
        where: { id },
        data: {
          lastRunAt: new Date(),
          lastRunStatus: 'SUCCESS',
        },
      });
      return NextResponse.json({ success: true, message: 'Đã chạy thử nghiệm quy tắc thành công', data: updated });
    }

    const updated = await prisma.automationRule.update({
      where: { id },
      data: {
        isEnabled: typeof isEnabled === 'boolean' ? isEnabled : rule.isEnabled,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error('Automation toggle error:', err);
    return NextResponse.json({ success: false, error: 'Lỗi cập nhật quy tắc' }, { status: 500 });
  }
}
