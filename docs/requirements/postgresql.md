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

## Important Changes Since Prior Version

Prior: `16.x`; latest researched: `18.4` stable.

- Moving from 16 to 18 is a major database upgrade that requires `pg_upgrade`,
  dump/restore, or logical replication.
- PostgreSQL 18 enables data checksums by default for new clusters, which
  matters for upgrade planning.
- New useful capabilities include `uuidv7()`, skip scans for multicolumn
  B-tree indexes, virtual generated columns by default, and temporal
  constraints.
- PostgreSQL 18.4 includes security fixes; patch upgrades within 18.x do not
  require dump/restore.
- For this case, `uuidv7()` is a strong patient ID candidate, but any real DB
  upgrade remains operationally high risk.

Sources: [PostgreSQL 18 release notes](https://www.postgresql.org/docs/current/release-18.html),
[PostgreSQL 18.4 release notes](https://www.postgresql.org/docs/current/release-18-4.html).

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
