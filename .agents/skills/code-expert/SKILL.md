---
name: code-expert
description: >-
  Advanced software engineering best practices, design patterns, clean architecture, transactional safety, idempotency, strict TypeScript, and comprehensive testing. Use for backend, domain logic, data reconciliation, and architectural designs.
---

# Code Expert Skill

## Core Engineering Principles
1. **Layered Architecture & Separation of Concerns**:
   - Route Handlers / Controllers: Validate input, authenticate, authorize, call services, return formatted responses.
   - Domain Services: Business rules, transactions, orchestration, calculations.
   - Repositories / Data Access: Prisma queries, database operations, locking, integrity.
   - Providers / Adapters: Third-party API abstraction (VietQR, SePay, Casso, Telegram).
2. **Strict Type Safety**:
   - Zero `any`. Use strict TypeScript interfaces, Zod schemas, and branded types where appropriate.
   - All runtime boundaries (webhooks, query params, request bodies) must be validated with Zod.
3. **Idempotency & Concurrency**:
   - Use atomic database transactions (`prisma.$transaction`) with appropriate isolation.
   - Guard against duplicate webhook deliveries with unique database constraints.
   - Handle concurrent payments gracefully without race conditions.
4. **Financial Accuracy**:
   - Currency: Always use integer VND amounts (`BigInt` or `Int`), NEVER floating-point.
   - Explicit allocations and audit trails for partial and excess payments.
5. **Defensive Error Handling**:
   - Fail fast with informative, typed domain errors.
   - Never suppress errors silently or return 200 OK when processing failed fatally.
   - Safe logging: Never log credentials, API keys, webhook secrets, or raw sensitive customer PII.
6. **Testing Rigor**:
   - Unit test pure business logic (pricing, fee calculations, payment codes, normalization).
   - Integration test webhook flows, idempotency, and state transitions.
