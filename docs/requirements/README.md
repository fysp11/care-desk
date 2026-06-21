# Requirements Inventory

## Purpose

This folder inventories the libraries, tools, and platform requirements named
in the Patients Management case challenge.

## Classification

| Status | Meaning |
|---|---|
| Required | Explicitly required by the challenge. |
| Required capability | The capability is required; the named library is an example implementation. |
| Preferred | Named as preferred, but alternatives are allowed. |
| Plus / optional | Named as a plus, bonus, or conditional deliverable. |
| Evaluated | Named as part of developer-experience evaluation. |

## Version Comparison

Checked on 2026-06-21.

| Requirement | Prior no-search version | Latest researched version |
|---|---:|---:|
| Next.js | `next@14.2.x` | `next@16.2.9` |
| TypeScript | `typescript@5.5.x` | `typescript@6.0.3` |
| NestJS | `@nestjs/core@10.x` | `@nestjs/core@11.1.27` |
| PostgreSQL | `16.x` | `18.4` stable |
| JWT authentication | `jsonwebtoken@9.0.x`, `@nestjs/jwt@10.x` | `jsonwebtoken@9.0.3`, `@nestjs/jwt@11.0.2` |
| bcrypt | `bcrypt@5.1.x` | `bcrypt@6.0.0` |
| class-validator | `class-validator@0.14.x` | `class-validator@0.15.1` |
| zod + react-hook-form | `zod@3.23.x`, `react-hook-form@7.52.x` | `zod@4.4.3`, `react-hook-form@7.80.0` |
| Tailwind CSS | `tailwindcss@3.4.x` | `tailwindcss@4.3.1` |
| shadcn/ui | N/A; no single component-library version | `shadcn@4.11.0`; no single component-library version |
| Prisma | `prisma@5.15.x` | `prisma@7.8.0` |
| ESLint | `eslint@9.x` | `eslint@10.5.0` |
| Prettier | `prettier@3.3.x` | `prettier@3.8.4` |
| Docker / Docker Compose | Docker Compose `2.27.x` | Docker Compose `v5.1.4` |
| Cloud hosting | N/A | N/A |

## Upgrade Impact Summary

| Requirement | Most important change | Case-challenge impact |
|---|---|---|
| Next.js | React 19 baseline, async request APIs, Turbopack default, middleware-to-proxy shift | Keep auth/session and patient data fetching simple, explicit, and testable. |
| TypeScript | Stricter/default config changes and more explicit project setup | Use explicit frontend/backend `tsconfig` files and run typecheck early. |
| NestJS | Node 20+, Express v5 default, changed route/query parsing behavior | Integration-test auth guards, middleware order, and patient list query params. |
| PostgreSQL | Major upgrade path plus new `uuidv7()` and temporal/index features | Useful for patient IDs, but real major DB upgrades remain operationally high risk. |
| JWT authentication | `@nestjs/jwt` aligns with Nest 11; `jsonwebtoken` v9 security baseline remains important | Pin algorithms, avoid weak keys, and test expired/forged token paths. |
| bcrypt | Node <=16 dropped; native packaging changed | Verify Docker/CI install and seeded-login tests. |
| class-validator | `@IsIBAN()` signature change; unknown-value behavior remains important | Retest DTOs, nested validation, PATCH DTOs, and validation groups. |
| zod + react-hook-form | Zod 4 error/default semantics changed; RHF v7 behavior fixes around defaults/dirty state | Audit form error mapping, edit defaults, reset/cancel, and API payload shape. |
| Tailwind CSS | v4 CSS-first setup, package split, removed utilities, visual default changes | Manually verify focus rings, validation states, tables, and responsive behavior. |
| shadcn/ui | CLI/registry workflow, not a versioned component runtime | Review generated components as owned source and add only needed primitives. |
| Prisma | v7 ESM/config/client-generation/driver-adapter changes | Largest app-code migration risk; audit `PrismaService`, migrations, seed, errors, and tests. |
| ESLint | v10 requires Node 20.19+ and flat config only | Start with flat config and keep linting scoped to the timebox. |
| Prettier | No major break; mostly formatting/parser fixes | Low risk; pin and run consistently to avoid noisy diffs. |
| Docker / Docker Compose | v5 delegates builds to Bake/buildx | Keep Compose minimal for PostgreSQL/local dev and test on installed Docker Desktop/CLI. |
| Cloud hosting | Still not a versioned tool | Optional bonus only; avoid spending time before local proof is stable. |

## Inventory

| Requirement | Status | File |
|---|---|---|
| Next.js | Required | [nextjs.md](nextjs.md) |
| TypeScript | Required | [typescript.md](typescript.md) |
| NestJS | Required | [nestjs.md](nestjs.md) |
| PostgreSQL | Required | [postgresql.md](postgresql.md) |
| JWT authentication | Required capability | [jwt-auth.md](jwt-auth.md) |
| bcrypt | Required capability example | [bcrypt.md](bcrypt.md) |
| class-validator | Required capability example | [class-validator.md](class-validator.md) |
| zod + react-hook-form | Required capability example | [zod-react-hook-form.md](zod-react-hook-form.md) |
| Tailwind CSS | Preferred | [tailwind-css.md](tailwind-css.md) |
| shadcn/ui | Preferred | [shadcn-ui.md](shadcn-ui.md) |
| Prisma | Plus / optional | [prisma.md](prisma.md) |
| ESLint | Evaluated | [eslint.md](eslint.md) |
| Prettier | Evaluated | [prettier.md](prettier.md) |
| Docker / Docker Compose | Bonus | [docker-compose.md](docker-compose.md) |
| Cloud hosting | Optional deliverable | [cloud-hosting.md](cloud-hosting.md) |
