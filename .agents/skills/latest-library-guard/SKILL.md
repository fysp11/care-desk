---
name: latest-library-guard
description: Use when adding, configuring, upgrading, or reviewing any challenge-named library or tool, including Next.js, TypeScript, NestJS, PostgreSQL, Prisma, JWT, bcrypt, class-validator, Zod, React Hook Form, Tailwind, shadcn/ui, ESLint, Prettier, Docker Compose, or cloud hosting.
---

# Latest Library Guard Skill

## When To Use

Use this skill before writing code or configuration that depends on a
challenge-named library, framework, tool, or deployment target.

## Read First

- `docs/requirements/README.md`
- The matching file under `docs/requirements/`
- `.agents/rules/latest-library-implementation.md`

## Guardrails

1. Prefer the latest researched version.
2. Do not copy stale examples without checking the migration notes.
3. Document any downgrade or compatibility pin.
4. Add tests for behavior affected by version changes.
5. Run the smallest relevant check first.

## High-Risk Surfaces

- Prisma 7 client generation, ESM, config, and driver adapters.
- NestJS 11 route/query behavior and Node 20 baseline.
- Next.js 16 async request APIs and Turbopack defaults.
- Tailwind 4 CSS-first setup and visual default changes.
- Zod 4 error/default semantics.
- ESLint 10 flat config and Node 20.19 baseline.

## Output Expectations

State:

- Version targeted.
- Requirement file consulted.
- Compatibility risk.
- Verification run or still needed.

