---
title: Aster Pulse Case Rehearsal Summary
date: 2026-06-21
status: ready-for-practice
privacy: public-safe
---

# Case Rehearsal Summary

## Scope Thesis

> I shipped a small production-shaped patient-management slice where backend authorization, validation, and failure behavior are real, and UI polish is sufficient but intentionally bounded.

The case should be defended as backend-first, not backend-only. The frontend is a usable admin console: login, patient table, create/edit form, details view, loading/error/empty states, and role-gated actions with restrained styling.

## Backend And RBAC Defense

| Topic | Strong Answer |
|---|---|
| Why backend first | A polished UI on weak auth is misleading. The secure core comes first because users rely on server-side RBAC, validation, and error semantics. |
| Auth framing | Production-shaped mock: JWT expiry, hashed seeded users, guards, and `401`/`403` semantics; no signup, refresh tokens, password reset, or external identity provider in v1. |
| Authorization layer | Backend guards are authoritative. UI gating reduces friction but is not the security boundary. |
| Persistence | PostgreSQL plus Prisma demonstrates real constraints, migrations, pagination queries, and seeded users. If local setup became the risk, SQLite plus Prisma would be the documented fallback. |
| Validation | Client validation gives fast feedback; server DTO validation is authoritative for all API consumers. |
| List API | Use `page`, `limit`, `search`, `sortBy`, and `sortDir` query params; return `{ data, page, limit, total }`. |
| Error shape | Keep NestJS status codes and normalize key errors into `{ code, message, details? }` so the frontend can handle validation, auth, and simulated failure predictably. |

## TDAD Defense

TDAD means Test-Driven Agentic Development: a bounded agentic loop with behavior specs, impact-aware test choice, visible implementation tests, withheld self-checks, mutation-informed review, and explicit stop rules.

| Question | Strong Answer |
|---|---|
| How TDAD affected this case | Use lightweight controls: compact behavior list, impact-relevant API/UI tests, small vertical slices, and manual inspection of risky boundaries. |
| Visible vs hidden tests | Visible tests are the committed suite used during implementation. Hidden checks are withheld self-review prompts and adversarial manual cases run after green to reduce overfitting. |
| Mutation testing | Do not claim a full mutation run in the 3-4 hour version. Use mutation-informed review for auth and validation tests; treat a focused mutation check as a next hardening step. |
| GitNexus role | Use GitNexus or impact analysis as a focused review aid after changes, not as the core workflow or a substitute for understanding the code. |
| AI ownership | External checks beat trust: behavior specs, public-contract tests, targeted review, and explicit cuts make generated code defensible. |
| Repair loops | After repeated failures, stop the agent loop, diagnose root cause manually, narrow scope, or cut the feature. |

## Architecture Edge Cases

| Pressure Question | Defensible Position |
|---|---|
| Two admins edit same patient | V1 uses atomic updates and documents last-write-wins. Next hardening step is optimistic concurrency with `updatedAt` or version precondition checks plus conflict UI. |
| Audit trail | V1 has timestamps and authenticated actor context. Full audit logging is a documented next step because it changes schema, UI, retention, and compliance assumptions. |
| Multi-tenancy | V1 is single-tenant. Multi-tenancy would require organization-scoped users/patients and tenant-aware guards/queries because tenancy is an access-control invariant. |
| Delete semantics | Implement prompt-compatible delete for the demo, with a caveat that real healthcare systems likely require archive, retention, and audit semantics. |
| Patient identity | Use a surrogate ID as the true identifier. Unique email is only a scoped demo constraint if duplicate prevention is needed; it is not a safe universal clinical identifier. |
| Rate limiting and caching | Cut from v1. Pagination/query constraints came first; rate limiting and caching depend on traffic model and deployment boundary. |

## README And Cuts

The README should lead with the timebox, shipped slice, and tradeoffs before deep setup details.

| Cut | Why Cut | Next Step |
|---|---|---|
| Cloud hosting | Lower signal than local reproducibility and test evidence. | Add hosting after local setup and tests are stable. |
| Dark mode and advanced animation | Nice polish, but below secure backend behavior and usable UI states. | Add after core accessibility and responsive behavior are verified. |
| Audit log | Real auditability changes schema, UI, retention, and compliance assumptions. | Add append-only patient events before real clinical use. |
| Multi-tenancy | Tenant scope affects every data access path. | Add organization model, scoped guards, and tenant-aware queries. |
| Refresh tokens and password reset | Identity-product features are outside the trust-boundary slice. | Add when auth lifecycle becomes part of the product scope. |
| Caching and rate limiting | Optional performance controls should follow traffic assumptions. | Add once deployment and traffic profile are known. |
| Broad mutation testing | Valuable, but not worth crowding out core delivery in 3-4 hours. | Run focused mutation checks on RBAC and validation later. |

## Implementation Sequence

> I would build evidence-first: admin create as the tracer, user `403` as the trust boundary, then table/form UI, then stop early enough to verify and document cuts.

Recommended build order:

1. Scaffold Next.js, NestJS, Prisma, and PostgreSQL with seeded admin/user accounts.
2. Red-green tracer: login as admin, create patient through the API, assert persisted response.
3. Red-green trust boundary: login as user, attempt mutation, assert `403`.
4. Add list/search/sort/pagination and the usable admin UI.
5. Add dev-only latency/failure simulation behind an environment flag.
6. Use optimistic updates for edit/delete only; snapshot and restore on failure.
7. Protect the final 45 minutes for checks, blocking fixes only, README, and cut documentation.

## Follow-Up Lines To Practice

- "The UI is production-shaped, not brand-final."
- "Client validation is for UX; server validation is for trust."
- "A transaction makes a write atomic, but it does not prevent lost updates without version checks or locks."
- "I used AI for acceleration, then used TDAD-style external checks so I could own the result."
- "I stopped feature work before the end because the prompt explicitly evaluates knowing what to leave out."

