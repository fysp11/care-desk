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
