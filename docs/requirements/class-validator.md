# class-validator

## Prior No-Search Version

| Package | Prior known version | Source basis |
|---|---:|---|
| `class-validator` | `0.14.x` | Assistant memory before web/package-registry research |

## Latest Researched Version

| Package | Latest | Checked | Source |
|---|---:|---|---|
| `class-validator` | `0.15.1` | 2026-06-21 | [npm registry](https://registry.npmjs.org/class-validator/latest) |

## Status

Required capability example.

## Challenge Evidence

- Backend API design calls for proper validation and names `class-validator` for
  DTOs as an example.

## Implementation Role

Use DTO validation for:

- Login request shape.
- Patient create/update payloads.
- Query parameters such as `page`, `limit`, `search`, `sortBy`, and `sortDir`.

Expected backend behavior:

- Reject invalid input with `400`.
- Return predictable validation details.
- Treat server validation as authoritative, regardless of frontend validation.

## Inventory Decision

Backend DTO validation is required. `class-validator` is the challenge-aligned
default for a NestJS implementation.
