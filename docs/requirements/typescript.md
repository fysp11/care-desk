# TypeScript

## Prior No-Search Version

| Package | Prior known version | Source basis |
|---|---:|---|
| `typescript` | `5.5.x` | Assistant memory before web/package-registry research |

## Latest Researched Version

| Package | Latest | Checked | Source |
|---|---:|---|---|
| `typescript` | `6.0.3` | 2026-06-21 | [npm registry](https://registry.npmjs.org/typescript/latest) |

## Important Changes Since Prior Version

Prior: `5.5.x`; latest researched: `6.0.3`.

- TypeScript 6 changes several defaults, including stricter behavior, modern
  module/target assumptions, and `noUncheckedSideEffectImports`.
- Projects may need explicit Node types and explicit `rootDir`.
- Running `tsc file.ts` when a `tsconfig.json` exists now needs more deliberate
  invocation.
- For this case, use separate explicit frontend/backend `tsconfig` files and
  run typecheck early to catch DTO and form-contract drift.

Sources: [TypeScript 6 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/),
[TypeScript 6.0.3 release](https://github.com/microsoft/TypeScript/releases/tag/v6.0.3).

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
