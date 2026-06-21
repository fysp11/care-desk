# Prisma

## Prior No-Search Version

| Package | Prior known version | Source basis |
|---|---:|---|
| `prisma` | `5.15.x` | Assistant memory before web/package-registry research |

## Latest Researched Version

| Package | Latest | Checked | Source |
|---|---:|---|---|
| `prisma` | `7.8.0` | 2026-06-21 | [npm registry](https://registry.npmjs.org/prisma/latest) |

## Important Changes Since Prior Version

Prior: `5.15.x`; latest researched: `7.8.0`.

- This crosses Prisma 6 and 7, making it the largest app-code upgrade risk in
  the inventory.
- Prisma 7 requires Node 20.19+ and TypeScript 5.4+.
- Prisma ships as ESM, requires an explicit generated client output path, and
  no longer defaults client generation into `node_modules`.
- Configuration moves toward `prisma.config.ts`, and client construction now
  expects a driver adapter such as `@prisma/adapter-pg` or an Accelerate setup.
- v6 carry-over changes include `Bytes` moving to `Uint8Array` and
  `NotFoundError` removal in favor of `P2025`.
- For this case, audit `PrismaService`, migrations, seed flow, error mapping,
  transactions, and test setup before adopting Prisma 7.

Sources: [Prisma v7 upgrade guide](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7),
[Prisma v6 upgrade guide](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v6).

## Status

Plus / optional.

## Challenge Evidence

- Backend stack says "PostgreSQL (Prisma optional)."
- Technical requirements say "Prisma is a plus."
- Backend architecture says to use an ORM, with Prisma as an example.

## Implementation Role

Use Prisma for:

- PostgreSQL schema modeling.
- Migrations.
- Type-safe patient and user queries.
- Seed data for demo users and patients.

## Inventory Decision

Prisma is not strictly required, but it is the challenge-aligned ORM choice and
is worth using unless setup time threatens the core delivery.
