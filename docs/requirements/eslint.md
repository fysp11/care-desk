# ESLint

## Prior No-Search Version

| Package | Prior known version | Source basis |
|---|---:|---|
| `eslint` | `9.x` | Assistant memory before web/package-registry research |

## Latest Researched Version

| Package | Latest | Checked | Source |
|---|---:|---|---|
| `eslint` | `10.5.0` | 2026-06-21 | [npm registry](https://registry.npmjs.org/eslint/latest) |

## Important Changes Since Prior Version

Prior: `9.x`; latest researched: `10.5.0`.

- ESLint 10 requires Node `^20.19.0 || ^22.13.0 || >=24`.
- Legacy `.eslintrc` support is removed; flat `eslint.config.*` is mandatory.
- `eslint:recommended` includes additional rules and config lookup starts from
  each linted file's directory.
- `eslint-env` comments are errors, and JSX identifiers are now real scope
  references.
- For this case, start with flat config from the beginning and keep lint scope
  simple enough not to consume the timebox.

Sources: [ESLint v10 migration guide](https://eslint.org/docs/latest/use/migrate-to-10.0.0),
[npm eslint latest](https://registry.npmjs.org/eslint/latest).

## Status

Evaluated developer-experience requirement.

## Challenge Evidence

- Developer experience evaluation names "ESLint + Prettier + strict TypeScript
  configuration."

## Implementation Role

Use ESLint for:

- TypeScript code quality checks.
- Frontend and backend consistency.
- Catching unused variables, unsafe patterns, and framework-specific mistakes.

## Inventory Decision

ESLint is part of the expected developer-experience story. It should be present
if setup time allows, especially because the challenge explicitly evaluates code
quality and maintainability.
