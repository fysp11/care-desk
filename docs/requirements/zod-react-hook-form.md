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

## Important Changes Since Prior Version

Prior: `zod@3.23.x`, `react-hook-form@7.52.x`; latest researched:
`zod@4.4.3`, `react-hook-form@7.80.0`.

- Zod 4 changes error customization, removes `ZodError.errors` in favor of
  `.issues`, and deprecates older formatting patterns.
- Zod defaults and optional object fields can produce different parsed payloads
  than Zod 3.
- Zod string helpers shifted toward top-level helpers such as `z.email()` and
  stricter UUID handling.
- React Hook Form remains v7, with mostly fixes and additions around field
  arrays, default/reset behavior, dirty tracking, async resolver timing, and
  StrictMode/fast-refresh behavior.
- For this case, test edit-form defaults, reset/cancel, client error mapping,
  and server DTO alignment.

Sources: [Zod 4 migration guide](https://zod.dev/v4/changelog),
[Zod 4 notes](https://zod.dev/v4),
[React Hook Form 7.80.0 release](https://github.com/react-hook-form/react-hook-form/releases/tag/v7.80.0).

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
