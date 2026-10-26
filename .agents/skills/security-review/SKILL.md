---
name: security-review
description: >-
  Security auditing for SaaS fintech and payment platforms: authentication, authorization, webhook verification, IDOR prevention, PII protection, and safe secret management.
---

# Security Review Skill

## Core Security Rules
1. **Financial Authorization & IDOR Guard**:
   - Every invoice, member, attendance, and group query must enforce ownership checks: `userId: session.userId` or `group: { userId: session.userId }`.
   - Public portals must only expose masked, high-entropy tokens (`publicToken`), NEVER sequential IDs.
2. **Webhook Cryptographic & Header Verification**:
   - SePay: Verify `Authorization` Bearer/API Key token against server secret.
   - Casso: Verify `secure-token` header against server secret.
   - Reject malformed or unauthorized webhook requests with 401/400.
3. **Idempotency & Replay Defense**:
   - Unique constraints on `[provider, providerTransactionId]` must be enforced at database level.
4. **Zero Client Authority on Financial States**:
   - Clients must never send status updates to `PAID` or override `amountPaid`. Only trusted webhook reconciliation or authenticated manual reconciliation with audit trail can allocate money.
5. **PII and Secret Protection**:
   - Redact passwords, bearer tokens, webhook keys from all logs.
   - Never expose parents' phone numbers on public student portals.
