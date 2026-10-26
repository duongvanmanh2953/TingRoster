import { NextRequest, NextResponse } from 'next/server';
import { CassoProvider, CassoPayloadSchema } from '@/lib/providers/casso';
import { ReconciliationService } from '@/server/services/reconciliation.service';
import { ZodError } from 'zod';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Casso secure-token header
    const secureToken = req.headers.get('secure-token');
    const authResult = CassoProvider.verifyWebhook(secureToken);

    if (!authResult.isValid) {
      console.warn('[Casso Webhook] Verification failed:', authResult.error);
      return NextResponse.json(
        { error: 1, message: authResult.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parse body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 1, message: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    // 3. Validate Casso schema
    let parsedPayload;
    try {
      parsedPayload = CassoPayloadSchema.parse(body);
    } catch (err) {
      if (err instanceof ZodError) {
        return NextResponse.json(
          { error: 1, message: 'Payload schema invalid', details: err.errors },
          { status: 400 }
        );
      }
      throw err;
    }

    // 4. Process each transaction in batch
    const results = [];
    for (const item of parsedPayload.data) {
      const normalizedTx = CassoProvider.normalizeItem(
        item,
        body as Record<string, unknown>
      );
      const res = await ReconciliationService.reconcileTransaction(normalizedTx);
      results.push(res);
    }

    return NextResponse.json({
      error: 0,
      message: 'Batch processed successfully',
      data: results,
    });
  } catch (err: unknown) {
    console.error('[Casso Webhook Error]:', err);
    return NextResponse.json(
      { error: 1, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
