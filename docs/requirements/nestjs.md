# NestJS

## Prior No-Search Version

| Package | Prior known version | Source basis |
|---|---:|---|
| `@nestjs/core` | `10.x` | Assistant memory before web/package-registry research |

## Latest Researched Version

| Package | Latest | Checked | Source |
|---|---:|---|---|
| `@nestjs/core` | `11.1.27` | 2026-06-21 | [npm registry](https://registry.npmjs.org/@nestjs/core/latest) |

## Status

Required.

## Challenge Evidence

- The objective asks for a "NestJS backend."
- The technical requirements list "Next.js + TypeScript + NestJS" as required.

## Implementation Role

Use NestJS for the backend API:

- `AuthModule` for login and token issuance.
- `PatientsModule` for patient CRUD and list behavior.
- Guards or middleware for authentication and role authorization.
- DTOs for request validation.
- Services and repositories for clean separation of concerns.
- Consistent REST endpoints and status codes.

## Inventory Decision

This is a required backend framework. A simpler custom Bun/Express API would not
match the challenge as written.
