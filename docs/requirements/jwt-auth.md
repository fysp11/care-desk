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

## Important Changes Since Prior Version

Prior: `jsonwebtoken@9.0.x`, `@nestjs/jwt@10.x`; latest researched:
`jsonwebtoken@9.0.3`, `@nestjs/jwt@11.0.2`.

- `jsonwebtoken` stays within major 9, so there is no new major-version break,
  but `9.0.3` updates underlying signing dependencies.
- The v9 baseline rejects insecure defaults: unsigned tokens require explicit
  allowance, RSA keys must be strong enough, and key types must match
  algorithms.
- `@nestjs/jwt` 11 aligns with Nest 11 and depends on `jsonwebtoken@9.0.3`.
- For this case, pin algorithms, test expired/forged tokens, and avoid weak
  demo test keys.

Sources: [jsonwebtoken changelog](https://raw.githubusercontent.com/auth0/node-jsonwebtoken/master/CHANGELOG.md),
[jsonwebtoken v9 migration notes](https://github.com/auth0/node-jsonwebtoken/wiki/Migration-Notes%3A-v8-to-v9),
[@nestjs/jwt 11.0.2 release](https://github.com/nestjs/jwt/releases/tag/11.0.2).

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
