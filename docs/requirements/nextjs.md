# Next.js

## Prior No-Search Version

| Package | Prior known version | Source basis |
|---|---:|---|
| `next` | `14.2.x` | Assistant memory before web/package-registry research |

## Latest Researched Version

| Package | Latest | Checked | Source |
|---|---:|---|---|
| `next` | `16.2.9` | 2026-06-21 | [npm registry](https://registry.npmjs.org/next/latest) |

## Important Changes Since Prior Version

Prior: `14.2.x`; latest researched: `16.2.9`.

- React 19 is now the practical baseline through the Next 15/16 path.
- Request APIs moved from sync-compatible behavior to async-only patterns:
  `cookies()`, `headers()`, `draftMode()`, `params`, and `searchParams`.
- Turbopack is now the default for development and production builds; custom
  Webpack assumptions need review.
- `middleware` has shifted toward `proxy`, with runtime and naming implications
  for auth/session boundaries.
- For this case, keep patient data cache behavior explicit and keep auth route
  protection simple enough to defend.

Sources: [Next 15 upgrade](https://nextjs.org/docs/app/guides/upgrading/version-15),
[Next 16 upgrade](https://nextjs.org/docs/app/guides/upgrading/version-16).

## Status

Required.

## Challenge Evidence

- The objective asks for a full-stack system with a "Next.js + TypeScript
  frontend."
- The technical requirements repeat: "Stack: Next.js + TypeScript + NestJS
  (required)."

## Implementation Role

Use Next.js for the frontend application:

- Login page.
- Protected patient-management routes.
- Patients table with search, sort, pagination, loading, empty, and error
  states.
- Create/edit patient form.
- Patient details view.
- Role-aware UI controls.

## Inventory Decision

This should be treated as non-negotiable for the submitted implementation.
