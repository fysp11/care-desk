# class-validator

## Prior No-Search Version

| Package | Prior known version | Source basis |
|---|---:|---|
| `class-validator` | `0.14.x` | Assistant memory before web/package-registry research |

## Latest Researched Version

| Package | Latest | Checked | Source |
|---|---:|---|---|
| `class-validator` | `0.15.1` | 2026-06-21 | [npm registry](https://registry.npmjs.org/class-validator/latest) |

## Important Changes Since Prior Version

Prior: `0.14.x`; latest researched: `0.15.1`.

- `@IsIBAN()` changed its options signature, which can break existing decorator
  usage.
- The 0.14 baseline already made `forbidUnknownValues` default to true, which
  can affect validation groups and nested DTOs.
- For this case, retest patient create/update DTOs, nested objects, PATCH DTOs,
  and any group-based validation.

Source: [class-validator changelog](https://raw.githubusercontent.com/typestack/class-validator/develop/CHANGELOG.md).

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
