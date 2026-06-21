# Tailwind CSS

## Prior No-Search Version

| Package | Prior known version | Source basis |
|---|---:|---|
| `tailwindcss` | `3.4.x` | Assistant memory before web/package-registry research |

## Latest Researched Version

| Package | Latest | Checked | Source |
|---|---:|---|---|
| `tailwindcss` | `4.3.1` | 2026-06-21 | [npm registry](https://registry.npmjs.org/tailwindcss/latest) |

## Important Changes Since Prior Version

Prior: `3.4.x`; latest researched: `4.3.1`.

- Tailwind 4 uses a CSS-first setup with `@import "tailwindcss"` instead of
  the old `@tailwind` directives.
- The PostCSS plugin moved to `@tailwindcss/postcss`; the CLI moved to
  `@tailwindcss/cli`.
- Some deprecated utilities were removed and visual defaults changed for
  borders, divide colors, rings, shadows, radius, and blur scales.
- Browser support floor is higher.
- For this case, explicitly verify focus rings, validation states, table
  borders, badges, and responsive patient-table behavior.

Sources: [Tailwind v4 upgrade guide](https://tailwindcss.com/docs/upgrade-guide),
[Tailwind releases](https://github.com/tailwindlabs/tailwindcss/releases).

## Status

Preferred.

## Challenge Evidence

- Styling says "Tailwind CSS + shadcn/ui preferred."
- Technical requirements say any styling approach is acceptable, but Tailwind
  plus shadcn/ui is preferred.

## Implementation Role

Use Tailwind CSS for:

- Layout and spacing.
- Responsive table behavior.
- Focus, hover, disabled, loading, empty, and error states.
- Design-token expression for semantic colors and spacing.

## Inventory Decision

Tailwind CSS is not strictly required, but using it matches the stated
preference and reduces explanation overhead.
