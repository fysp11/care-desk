# Docker / Docker Compose

## Prior No-Search Version

| Tool | Prior known version | Source basis |
|---|---:|---|
| Docker Compose | `2.27.x` | Assistant memory before web/package-registry research |

## Latest Researched Version

| Tool | Latest | Checked | Source |
|---|---:|---|---|
| Docker Compose | `v5.1.4` | 2026-06-21 | [GitHub releases](https://github.com/docker/compose/releases/tag/v5.1.4) |

Note: Docker Desktop may bundle Docker Compose on its own release cadence.

## Status

Bonus.

## Challenge Evidence

- Bonus points mention Docker setup with Docker and Docker Compose.

## Implementation Role

Use Docker Compose to make local dependencies reproducible:

- PostgreSQL service.
- Optional API and frontend containers if time allows.
- Environment variable examples using placeholders only.

## Inventory Decision

Docker Compose is a useful bonus, especially for PostgreSQL reproducibility, but
it should not crowd out the core RBAC, validation, patient workflow, and tests.
