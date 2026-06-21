# bcrypt

## Prior No-Search Version

| Package | Prior known version | Source basis |
|---|---:|---|
| `bcrypt` | `5.1.x` | Assistant memory before web/package-registry research |

## Latest Researched Version

| Package | Latest | Checked | Source |
|---|---:|---|---|
| `bcrypt` | `6.0.0` | 2026-06-21 | [npm registry](https://registry.npmjs.org/bcrypt/latest) |

## Status

Required capability example.

## Challenge Evidence

- Backend security requirements call for password hashing and name `bcrypt` as
  the example.

## Implementation Role

Use bcrypt or an equivalent password-hashing library for seeded demo users.

Expected behavior:

- Store password hashes, not plain text.
- Compare login password input against the stored hash.
- Keep demo credentials documented without exposing real secrets.

## Inventory Decision

Password hashing is required. `bcrypt` is the named example and is the safest
default unless the implementation has a clear reason to choose a compatible
alternative.
