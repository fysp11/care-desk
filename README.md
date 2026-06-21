# Care Desk

A minimal Bun + TypeScript starter for a care desk service.

## Requirements

- Bun 1.3+

## Scripts

- `bun run dev` starts the service in watch mode.
- `bun run start` starts the service once.
- `bun test` runs the test suite.
- `bun run typecheck` checks TypeScript types.

## API

- `GET /` returns service metadata.
- `GET /health` returns health status.
- `GET /tickets` returns starter care desk tickets.
