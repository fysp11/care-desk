# shadcn/ui

## Prior No-Search Version

| Package/tool | Prior known version | Source basis |
|---|---:|---|
| shadcn/ui | N/A | Assistant memory before web/package-registry research; no single versioned component library |

## Latest Researched Version

| Package/tool | Latest | Checked | Source |
|---|---:|---|---|
| `shadcn` CLI | `4.11.0` | 2026-06-21 | [npm registry](https://registry.npmjs.org/shadcn/latest) |
| `shadcn-ui` package | `0.9.5` | 2026-06-21 | [npm registry](https://registry.npmjs.org/shadcn-ui/latest) |

Note: shadcn/ui is not a single versioned component library. The practical
version target is the `shadcn` CLI/registry workflow used to copy components
into the app.

## Important Changes Since Prior Version

Prior: no single versioned component library; latest researched: `shadcn` CLI
`4.11.0`.

- shadcn/ui remains copied component source rather than a normal runtime
  component dependency.
- The modern CLI supports workflows such as `init`, `add`, `view`, `search`,
  `migrate`, `diff`, `docs`, presets, and registry usage.
- New generated components may differ from older copied components and will not
  update existing local components automatically.
- Tailwind 4 and modern shadcn conventions can introduce styling differences.
- For this case, use the CLI selectively for accessible primitives and review
  generated source like application code.

Sources: [shadcn CLI docs](https://ui.shadcn.com/docs/cli),
[shadcn changelog](https://ui.shadcn.com/docs/changelog),
[shadcn 4.11.0 release](https://github.com/shadcn-ui/ui/releases/tag/shadcn%404.11.0).

## Status

Preferred.

## Challenge Evidence

- Styling says "Tailwind CSS + shadcn/ui preferred."
- Technical requirements repeat that Tailwind plus shadcn/ui is preferred while
  allowing any styling approach.

## Implementation Role

Use shadcn/ui for accessible, composable UI primitives:

- Buttons.
- Inputs.
- Dialog or modal for details.
- Table primitives or nearby components.
- Form and feedback components where useful.

## Inventory Decision

shadcn/ui is preferred, not mandatory. It is a strong default for speed,
accessibility, and a polished admin-console baseline.
