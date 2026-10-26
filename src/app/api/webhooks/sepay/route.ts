import { NextRequest, NextResponse } from 'next/server';
import { SePayProvider } from '@/lib/providers/sepay';
import { ReconciliationService } from '@/server/services/reconciliation.service';
import { ZodError } from 'zod';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Webhook Authentication verification
    const authHeader = req.headers.get('authorization');
    const authResult = SePayProvider.verifyWebhook(authHeader);

    if (!authResult.isValid) {
      console.warn('[SePay Webhook] Authentication failed:', authResult.error);
      return NextResponse.json(
        { success: false, error: authResult.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Read and parse JSON body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Request body must be valid JSON' },
        { status: 400 }
      );
    }

    // 3. Normalize transaction
    let normalizedTx;
    try {
      normalizedTx = SePayProvider.normalize(body);
    } catch (err) {
      if (err instanceof ZodError) {
        console.warn('[SePay Webhook] Validation failed:', err.errors);
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid payload structure',
            details: err.errors,
          },
          { status: 400 }
        );
      }
      throw err;
    }

    // 4. Atomically reconcile transaction
    const result = await ReconciliationService.reconcileTransaction(normalizedTx);

    // 5. Response contract
    // SePay expects HTTP 200/201 with success: true for handled webhooks (including duplicates)
    return NextResponse.json(
      {
        success: true,
        data: {
          transactionId: normalizedTx.providerTransactionId,
          status: result.status,
          duplicate: result.duplicate ?? false,
          invoiceId: result.invoiceId ?? null,
          paymentCode: result.paymentCode ?? null,
          amountAllocated: result.amountAllocated ?? 0,
          message: result.message,
        },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('[SePay Webhook Error]:', err);
    // Return 500 so provider knows to retry if it is a transient infrastructure or database error
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
