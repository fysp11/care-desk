# TypeScript

## Prior No-Search Version

| Package | Prior known version | Source basis |
|---|---:|---|
| `typescript` | `5.5.x` | Assistant memory before web/package-registry research |

## Latest Researched Version

| Package | Latest | Checked | Source |
|---|---:|---|---|
| `typescript` | `6.0.3` | 2026-06-21 | [npm registry](https://registry.npmjs.org/typescript/latest) |

## Status

Required.

## Challenge Evidence

- The frontend is specified as "Next.js + TypeScript."
- The backend is specified as "NestJS + TypeScript."
- The technical requirements list "Next.js + TypeScript + NestJS" as required.

## Implementation Role

Use TypeScript across frontend, backend, shared contracts, tests, and tooling.

Expected uses:

- Strict request and response types.
- Patient and user domain types.
- DTO and API contract alignment.
- Type-safe component props and form state.
- Strict TypeScript configuration as part of developer experience.

## Inventory Decision

This should be treated as a cross-cutting requirement, not only a language
choice for one side of the app.
