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

Follow `.agents/rules/latest-library-implementation.md` as the canonical
rule. Use `docs/requirements/README.md` for the version matrix, then read the
specific requirement file before implementing or reviewing code.

Default posture:

- Prefer the latest researched version.
- Document any downgrade or compatibility pin.
- Test behavior affected by version changes.
- Run the smallest relevant check first.

## Output Expectations

State:

- Version targeted.
- Requirement file consulted.
- Compatibility risk.
- Verification run or still needed.
