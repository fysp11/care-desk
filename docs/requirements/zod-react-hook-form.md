# zod + react-hook-form

## Prior No-Search Version

| Package | Prior known version | Source basis |
|---|---:|---|
| `zod` | `3.23.x` | Assistant memory before web/package-registry research |
| `react-hook-form` | `7.52.x` | Assistant memory before web/package-registry research |

## Latest Researched Version

| Package | Latest | Checked | Source |
|---|---:|---|---|
| `zod` | `4.4.3` | 2026-06-21 | [npm registry](https://registry.npmjs.org/zod/latest) |
| `react-hook-form` | `7.80.0` | 2026-06-21 | [npm registry](https://registry.npmjs.org/react-hook-form/latest) |

## Status

Required capability example.

## Challenge Evidence

- The patient create/edit scope requires strong client validation and names
  `zod + react-hook-form` as an example.

## Implementation Role

Use zod and react-hook-form, or an equivalent pairing, for patient forms:

- `firstName`
- `lastName`
- `email`
- `phoneNumber`
- `dob`

Expected frontend behavior:

- Fast client-side feedback.
- Accessible validation messages.
- Submission blocked for invalid local input.
- Server validation still remains authoritative.

## Inventory Decision

Strong client validation is required. `zod + react-hook-form` is the preferred
implementation path because it is explicitly named and fits Next.js well.
