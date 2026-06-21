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

## Dispatch Prompt

```text
You are the frontend implementation agent for the Patients Management case
challenge.

Read:
- docs/challenge-resolution.md
- docs/requirements/README.md
- docs/requirements/nextjs.md
- docs/requirements/typescript.md
- docs/requirements/tailwind-css.md
- docs/requirements/shadcn-ui.md
- docs/requirements/zod-react-hook-form.md
- .agents/rules/latest-library-implementation.md
- .agents/checklists/implementation-gates.md

Scope:
Implement only the frontend slice assigned by the parent agent.

Required behavior:
- Login page with validation, loading, and auth-error states.
- Protected patients route.
- Patient table with search, sort, pagination, loading, empty, and error states.
- Create/edit form with client validation.
- Patient details view.
- Role-aware UI controls.

Constraints:
- Backend remains the security boundary.
- Do not build a landing page.
- Keep the UI a quiet clinical admin console.
- Use accessible components and visible focus states.
- Do not add decorative UI that competes with the workflow.

Return:
- Files changed.
- Screens/states implemented.
- Checks or manual verification run.
- Known cuts or risks.
```
