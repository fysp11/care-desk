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

## Important Changes Since Prior Version

Prior: Docker Compose `2.27.x`; latest researched: `v5.1.4`.

- Docker skipped Compose 3.x and 4.x to avoid confusion with legacy Compose file
  versions.
- Compose v5 removes its internal builder and delegates builds to Docker
  Bake/buildx.
- v5.1.4 is mostly fixes around Docker Desktop proxy routing, publish env-value
  warnings, and provider stop hooks.
- For this case, keep Compose boring: PostgreSQL service, env placeholders, no
  obsolete top-level `version`, and no secrets committed.

Sources: [Docker Compose v5.0.0](https://github.com/docker/compose/releases/tag/v5.0.0),
[Docker Compose v5.1.4](https://github.com/docker/compose/releases/tag/v5.1.4),
[Docker Compose v2.27.0](https://github.com/docker/compose/releases/tag/v2.27.0).

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
