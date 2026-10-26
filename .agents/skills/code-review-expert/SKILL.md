---
name: code-review-expert
description: >-
  Expert code review, structural integrity, error handling, performance optimization, and architectural risk assessment. Use when assessing refactoring, reviewing business logic, and validating pull requests.
---

# Code Review Expert Skill

## Principles & Checklist
1. **Architectural Cohesion**:
   - Single responsibility for each component, service, and API route handler.
   - Separation of presentation from business and database access logic.
2. **Robust Error Handling**:
   - Explicit typed errors rather than generic catch-all blocks.
   - Graceful recovery: background failures (e.g. notification webhooks) must never roll back committed transactions.
3. **Data Integrity & Concurrency**:
   - Check race conditions in concurrent write operations.
   - Ensure idempotency in webhook ingestion and financial mutation handlers.
4. **Performance & Scalability**:
   - Prevent N+1 queries by leveraging Prisma relation joins and selective projections (`select`).
   - Paginate unbounded collections (`take`, `skip`).
5. **Security & Authorization**:
   - Never rely on client-supplied `userId`. Enforce server session verification.
   - Sanitize all parameters and never expose credentials, secrets, or internal stack traces.
