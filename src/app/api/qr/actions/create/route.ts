import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/jwt';
import { createActionQr, ActionType, ContextType } from '@/lib/qr/actionEngine';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const CreateActionSchema = z.object({
  actionType: z.enum([
    'ATTENDANCE',
    'JOIN_SPACE',
    'JOIN_GROUP',
    'PAYMENT',
    'SHIFT_REGISTER',
    'SHIFT_CHECK_IN',
    'SHIFT_CHECK_OUT',
    'BOOKING',
    'EVENT_REGISTER',
  ]),
  groupId: z.string().min(1, 'groupId là bắt buộc'),
  contextType: z
    .enum(['CLASS', 'SESSION', 'INVOICE', 'BOOKING', 'SHIFT', 'SPACE', 'GENERAL'])
    .optional(),
  contextId: z.string().optional(),
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  ttlSeconds: z.number().int().positive().optional(),
  maxUsage: z.number().int().positive().nullable().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    const body = await req.json();
    const parsed = CreateActionSchema.parse(body);

    const actionQr = await createActionQr({
      actionType: parsed.actionType as ActionType,
      groupId: parsed.groupId,
      contextType: parsed.contextType as ContextType | undefined,
      contextId: parsed.contextId,
      title: parsed.title,
      description: parsed.description,
      metadata: parsed.metadata,
      ttlSeconds: parsed.ttlSeconds,
      maxUsage: parsed.maxUsage,
      createdBy: userId || undefined,
    });

    return NextResponse.json({
      success: true,
      data: actionQr,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi khi tạo mã Action QR';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
