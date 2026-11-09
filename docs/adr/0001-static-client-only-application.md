# ADR 0001: Use a static, client-only application

**Status:** Accepted

## Decision

Build Leads Tracker with Next.js App Router and `output: 'export'`. The app has
no backend, API routes, database, authentication, or external service.
Browser-created lead IDs use `/leads/view?id=<id>` and `/leads/edit?id=<id>`;
they never use a dynamic `[id]` route segment.

## Consequences

The generated `out/` directory can be served by any static-file host without a
SPA fallback. Features requiring a server, including API routes, server actions,
middleware, and cross-device sync, are out of scope for this product.

## Source

PRD sections 1.4 and 5. Next.js static-export documentation was checked on
2026-11-09.
