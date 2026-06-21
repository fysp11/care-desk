# PostgreSQL

## Prior No-Search Version

| Product | Prior known version | Source basis |
|---|---:|---|
| PostgreSQL | `16.x` | Assistant memory before web/package-registry research |

## Latest Researched Version

| Product | Latest stable | Checked | Source |
|---|---:|---|---|
| PostgreSQL | `18.4` | 2026-06-21 | [PostgreSQL releases](https://www.postgresql.org/docs/release/) |

Note: PostgreSQL `19 Beta 1` exists, but the stable production target is
`18.4`.

## Status

Required.

## Challenge Evidence

- The backend stack is named as "NestJS + TypeScript + PostgreSQL."
- The backend architecture section says to "Use a relational database
  (PostgreSQL)."

## Implementation Role

Use PostgreSQL as the relational persistence layer for:

- Seeded users.
- Patient records.
- Constraints and indexes.
- Pagination, search, and sorting queries.
- Migrations if paired with an ORM.

## Inventory Decision

PostgreSQL is part of the expected backend stack. If local setup becomes the
risk, any fallback should be documented clearly as a timebox tradeoff.
