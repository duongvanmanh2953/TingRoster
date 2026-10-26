---
name: vercel-react-best-practices
description: >-
  Official Next.js App Router and React best practices from Vercel: Server Components by default, streaming, optimistic updates, Server Actions / Route Handlers, TanStack Query integration, bundle optimization, and hydration error prevention. Use whenever writing React or Next.js code.
---

# Vercel & React Best Practices Skill

## Guidelines
1. **Server Components by Default**:
   - Keep data fetching and heavy rendering on the server.
   - Only add `'use client'` at the leaves of the component tree when browser events, hooks (`useState`, `useEffect`), or Web APIs are needed.
2. **Preventing Hydration Mismatches**:
   - Avoid rendering dates/times or non-deterministic values directly on server without client formatting safeguards.
   - Isolate client-only values behind mounted checks or `suppressHydrationWarning`.
3. **Data Fetching & Caching**:
   - Utilize TanStack Query for dynamic client state and refetching.
   - Implement optimistic updates for UI actions (e.g. attendance toggling) with instant rollback on error.
4. **Bundle & Performance Optimization**:
   - Dynamic imports (`next/dynamic`) for heavy interactive modals or charting libraries.
   - Use Lucide icons imported individually.
   - Optimize fonts with `next/font` (e.g., Inter or Outfit) to prevent layout shifts (CLS).
5. **Route Handlers**:
   - Clean typed JSON responses with standard error envelope.
   - Proper HTTP status codes (200, 201, 400, 401, 403, 404, 409, 500).
6. **Form Handling**:
   - Combine React Hook Form with Zod resolver for accessible, type-safe form validation with client and server parity.
