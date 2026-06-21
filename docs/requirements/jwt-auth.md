# JWT Authentication

## Prior No-Search Version

| Package | Prior known version | Source basis |
|---|---:|---|
| `jsonwebtoken` | `9.0.x` | Assistant memory before web/package-registry research |
| `@nestjs/jwt` | `10.x` | Assistant memory before web/package-registry research |

## Latest Researched Version

| Package | Latest | Checked | Source |
|---|---:|---|---|
| `jsonwebtoken` | `9.0.3` | 2026-06-21 | [npm registry](https://registry.npmjs.org/jsonwebtoken/latest) |
| `@nestjs/jwt` | `11.0.2` | 2026-06-21 | [npm registry](https://registry.npmjs.org/@nestjs/jwt/latest) |

## Status

Required capability.

## Challenge Evidence

- Authentication scope requires a persisted token with a `role` claim.
- Backend security requirements call for JWT-based authentication with token
  expiration.
- API behavior must return `401` and `403` where appropriate.

## Implementation Role

Use JWT-style authentication for:

- `POST /auth/login`.
- Token expiry handling.
- Authenticated requests.
- Role claim propagation for `admin` and `user`.
- Clear `401` behavior for missing, invalid, or expired tokens.

## Inventory Decision

The capability is required. The exact JWT package is an implementation choice,
but the behavior must be defensible in the follow-up interview.
