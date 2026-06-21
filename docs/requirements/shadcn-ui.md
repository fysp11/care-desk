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
