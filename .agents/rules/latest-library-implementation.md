# Latest Library Implementation Rule

## Purpose

Guard AI-driven development against stale package assumptions, deprecated APIs,
and unsafe implementation patterns when building the Patients Management case
challenge.

## Required Inputs

Before implementing code that uses a challenge-named library, framework, tool,
or platform, read:

- `docs/requirements/README.md`
- The matching file under `docs/requirements/`

Use the `Latest Researched Version` and `Important Changes Since Prior Version`
sections as the default implementation target.

## Rule

When generating or editing implementation code:

1. Prefer the latest researched version documented in `docs/requirements/`.
2. Do not implement against the prior no-search version unless the downgrade is
   explicitly chosen and documented as a tradeoff.
3. Check the relevant `Important Changes Since Prior Version` section before
   writing code that depends on framework APIs, configuration shape, CLI
   behavior, validation behavior, auth behavior, ORM behavior, or styling
   conventions.
4. If current package docs conflict with memory or older examples, follow the
   current package docs and note the decision.
5. If live verification is unavailable, state that the implementation is based
   on the repository's last researched version snapshot.

## Version-Specific Guardrails

| Area | Guardrail |
|---|---|
| Next.js | Use React 19-compatible patterns, async request APIs, explicit cache behavior for patient data, and review middleware/proxy choices. |
| TypeScript | Use explicit frontend/backend `tsconfig` files; do not rely on implicit Node types or loose defaults. |
| NestJS | Assume Node 20+ and Express 5 behavior; integration-test route patterns, query parsing, middleware order, and role guards. |
| PostgreSQL | Treat major upgrades as operationally high risk; prefer documented local setup and avoid unplanned production-style migration work. |
| Prisma | Treat Prisma 7 as a high-risk implementation surface; verify ESM usage, `prisma.config.ts`, generated client output, driver adapter, seed flow, and `P2025` error mapping. |
| JWT auth | Pin algorithms, reject unsigned/forged/expired tokens, avoid weak demo keys, and test `401`/`403` behavior. |
| bcrypt | Verify native package installation in CI/Docker and keep seeded login tests fast but realistic. |
| class-validator | Validate DTOs server-side; test nested DTOs, PATCH DTOs, validation groups, and unknown-value behavior. |
| Zod + React Hook Form | Audit Zod 4 error/default behavior and React Hook Form dirty/default/reset behavior before wiring patient forms. |
| Tailwind CSS | Use Tailwind 4 CSS-first conventions and manually verify focus rings, borders, tables, validation states, and responsive behavior. |
| shadcn/ui | Treat generated components as owned source; add only the primitives needed for the case. |
| ESLint | Use flat `eslint.config.*`; require Node 20.19+ if using ESLint 10. |
| Prettier | Pin and run consistently; expect possible Markdown/TypeScript formatting churn. |
| Docker Compose | Keep Compose minimal; avoid obsolete top-level `version`; use env placeholders and no committed secrets. |
| Cloud hosting | Treat hosting as optional until local run, tests, and README are stable. |

## Required Implementation Checklist

For any change that introduces or configures one of these libraries:

- [ ] Confirm the matching requirement file was read.
- [ ] Use the latest researched version or document why not.
- [ ] Apply the relevant guardrails from this rule.
- [ ] Add or update the smallest meaningful tests for the changed behavior.
- [ ] Run the smallest relevant verification command first.
- [ ] Document any intentional cuts or downgrade decisions in README or docs.

## Prohibited Patterns

- Do not copy older examples that use APIs the requirement docs flag as changed
  or deprecated.
- Do not silently downgrade a dependency to match stale generated code.
- Do not bypass backend authorization with frontend-only role checks.
- Do not treat generated shadcn/ui or AI-written code as unowned third-party
  code.
- Do not commit secrets, real credentials, or environment-specific absolute
  paths while following setup examples.

## Update Policy

If a package version is refreshed or a migration finding changes:

1. Update the relevant `docs/requirements/<requirement>.md` file.
2. Update `docs/requirements/README.md`.
3. Update this rule only when the guardrail itself changes.

