# Care Desk

Care Desk is a compact Patients Management case-challenge implementation.

## Prerequisites

- Node.js 20.19+

The repository is configured for npm workspaces and uses `npm`.

## Setup

```bash
git clone https://github.com/fysp11/care-desk.git && \
  cd care-desk
```

```bash
cp .env.example .env && \
  npm install &&
  npm run up
```

After dependencies are installed, `npm run up` starts PostgreSQL, applies
migrations, generates the Prisma client, seeds fictional demo data, and starts
the API and web app through Docker Compose.

## URLs

- WebApp Entrypoint: http://localhost:3000
- API Swagger: http://localhost:3001/api

Stop & Restart local services with:

```bash
npm run down
npm run restart
```

Useful DB commands:

```bash
npm run migrate
npm run seed
```

## Demo Login Fixtures

These credentials are public local fixtures only.

| Role  | Email               | Password         |
| ----- | ------------------- | ---------------- |
| Admin | `admin@example.com` | `admin-password` |
| User  | `user@example.com`  | `user-password`  |

## Checks

Run the normal verification commands from the repo root:

```bash
npm run typecheck
npm run lint
npm run test
npm run test:e2e
npm run build
```

`npm run test`, `npm run test:e2e`, and `npm run up` require Docker Compose and
a reachable local PostgreSQL container. If stale Compose containers point at an
old worktree, recreate them with `npm run down` and `npm run up` before rerunning
browser checks.
