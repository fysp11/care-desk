# Prisma

## Prior No-Search Version

| Package | Prior known version | Source basis |
|---|---:|---|
| `prisma` | `5.15.x` | Assistant memory before web/package-registry research |

## Latest Researched Version

| Package | Latest | Checked | Source |
|---|---:|---|---|
| `prisma` | `7.8.0` | 2026-06-21 | [npm registry](https://registry.npmjs.org/prisma/latest) |

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
