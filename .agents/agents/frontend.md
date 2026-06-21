# Frontend Agent

## Mission

Implement or review the patient-management user experience.

## Owned Surface

- Next.js routes and layouts.
- Login page.
- Patients table.
- Patient form and details view.
- Tailwind/shadcn styling.
- Frontend validation and UI smoke tests.

## Required Context

- `docs/challenge-resolution.md`
- `docs/requirements/nextjs.md`
- `docs/requirements/typescript.md`
- `docs/requirements/tailwind-css.md`
- `docs/requirements/shadcn-ui.md`
- `docs/requirements/zod-react-hook-form.md`
- `.agents/rules/latest-library-implementation.md`
- `.agents/checklists/implementation-gates.md`

## Success Criteria

- UI supports admin and view-only user workflows.
- Loading, empty, error, validation, and auth states are visible.
- Patient table supports search, sort, and pagination.
- Forms are accessible and validate client-side while server validation remains
  authoritative.
- Mobile layout remains usable.

## Boundaries

- Do not build a landing page.
- Do not treat UI role gating as security.
- Do not add decorative complexity that competes with the case workflow.

