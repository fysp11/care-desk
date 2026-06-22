# Wave 3: Frontend Workflow

## Decision

Wave 3 implements the usable Next.js patient-management workflow against the
Wave 1 auth and Wave 2 patient API contract. The screen should be the actual
working app entry point, not a landing page.

The backend remains the security boundary. Frontend role gating is UX only;
admin-only actions must still rely on backend `403` enforcement.

## Implementation Status

Status: implemented with documented cuts.

Wave 3 now provides a browser-local workflow in `apps/web`:

- Login/session handling with seeded admin and user demo affordances.
- Token persistence in browser storage, logout, and expired/failed-auth
  session clearing.
- Protected patient-management screen with search, sort, pagination, loading,
  empty, error, and retry states.
- Patient details for both roles.
- Admin-only create, edit, and delete controls.
- Zod 4 plus React Hook Form validation for patient create/edit fields.
- Local API CORS in `apps/api/src/main.ts` for localhost browser development.

shadcn/ui CLI generation is intentionally deferred. The UI primitives are
hand-written application source with accessible labels, focus states, and
server-side RBAC still treated as authoritative.

## Source Alignment

| Source | Applied here |
|---|---|
| `docs/roadmap.md` | Phase 3: login, protected patients route, table, form, details view, and role-gated actions. |
| `docs/challenge-resolution.md` | Build full-stack coherence on top of verified backend auth and patient API behavior. |
| `.agents/workflows/patient-management-case.md` | Implement frontend after backend auth/RBAC and patient contract exist. |
| `.agents/checklists/implementation-gates.md` | Frontend gate is the primary exit gate for this wave. |
| `.agents/rules/latest-library-implementation.md` | Use researched Next.js, TypeScript, Tailwind, shadcn/ui, Zod, and React Hook Form guidance. |
| `.agents/agents/frontend.md` | Frontend role owns screens, states, validation, and UI smoke checks. |

## Requirement Files Read

| Requirement | Version target | Wave 3 relevance |
|---|---:|---|
| `docs/requirements/nextjs.md` | `next@16.2.9` | App Router, React 19 patterns, explicit cache/auth behavior. |
| `docs/requirements/typescript.md` | `typescript@6.0.3` | Strict frontend contracts and component props. |
| `docs/requirements/tailwind-css.md` | `tailwindcss@4.3.1` | CSS-first Tailwind setup and focus/table/validation states. |
| `docs/requirements/shadcn-ui.md` | `shadcn@4.11.0` | Preferred accessible primitives; generated source is owned code. |
| `docs/requirements/zod-react-hook-form.md` | `zod@4.4.3`, `react-hook-form@7.80.0` | Client-side patient form validation and error mapping. |

## API Dependency

Wave 3 depends on these verified backend endpoints:

| Method | Path | Role | UI use |
|---|---|---|---|
| `POST` | `/auth/login` | Any | Login and session bootstrap. |
| `GET` | `/patients` | Admin/User | Table, search, sort, pagination. |
| `GET` | `/patients/:id` | Admin/User | Details view. |
| `POST` | `/patients` | Admin | Create form. |
| `PUT` | `/patients/:id` | Admin | Edit form. |
| `DELETE` | `/patients/:id` | Admin | Delete action. |

The local API default is `http://localhost:3001`. The frontend default should
work against that API in local development without requiring committed secrets.

## Scope

### Included

- Login page/state on the app entry screen.
- Token persistence in browser storage with logout.
- Protected patient-management view after login.
- Token-expiry/auth-failure handling that returns the user to login.
- Patients table with search, sort, pagination, loading, empty, and error
  states plus a retry affordance.
- Patient details view as modal/panel or inline section.
- Create/edit patient form with client validation for `firstName`, `lastName`,
  `email`, `phoneNumber`, and `dob`.
- Role-aware action controls: admin can see mutation actions, user gets a
  view-only workflow.
- API CORS or a frontend proxy so the browser workflow can call the backend in
  local dev.
- Focus, hover, disabled, validation, and responsive states.

### Deferred

- Optimistic update rollback and failure simulation.
- Broad shadcn/ui component generation.
- Dark mode if it threatens core workflow completion.
- Browser E2E automation and screenshot matrix.
- Cloud hosting.
- Production auth/session hardening.

## UX Contract

The first viewport should be the work surface:

- Logged out: compact login panel with demo-role affordances and auth errors.
- Logged in: quiet clinical admin console with toolbar, table, details/form
  region, and role/session controls.
- No marketing hero or explanatory landing page.

Use a restrained, multi-color semantic palette rather than a one-hue theme.
Tables and forms should be dense enough for repeated use but readable on mobile.

## Proposed Frontend Shape

```text
apps/web/
  app/
    page.tsx
    globals.css
  components/
    patient-form.tsx
    patient-table.tsx
    status-message.tsx
  lib/
    api.ts
    patient-schema.ts
    types.ts
```

The implementation follows this shape and keeps API access, validation schema,
session storage, and large UI sections separate enough to review.

## Work Items

| Status | Task | Owner artifact | Notes |
|---|---|---|---|
| Done | Confirm frontend dependency posture. | `.agents/agents/frontend.md` | Added `zod@4.4.3` and `react-hook-form@7.80.0`; lockfile resolves React to `19.2.7`. |
| Done | Wire local API integration. | `.agents/agents/frontend.md` | Web defaults to `http://localhost:3001`; API allows localhost/127.0.0.1 browser origins. |
| Done | Add login/session workflow. | `.agents/agents/frontend.md` | Stores demo token locally, supports logout, and clears failed/expired auth sessions. |
| Done | Add patients table workflow. | `.agents/agents/frontend.md` | Search, sort, pagination, loading, empty, error, and retry states are implemented. |
| Done | Add details and form workflow. | `.agents/agents/frontend.md` | Details panel plus admin create/edit/delete; user role remains view-only in UI. |
| Done | Add focused tests or smoke checks. | `.agents/agents/frontend.md` | Added helper and workflow-decision tests for validation, session expiry, API query building, auth failure mapping, app view selection, role gating, table sort behavior, pagination, and retry visibility. |
| Done | Run verification. | Main thread + verifier subagent | Web typecheck/test pass; API typecheck passes for CORS; build passes outside sandbox. |

## Subagent Loop

Wave 3 must use:

1. One implementation subagent scoped to frontend workflow files and any minimal
   API dev-integration config.
2. One verification subagent scoped to changed files, frontend gates, and
   command evidence.

Do not run parallel frontend implementation agents against the same app surface.
The login/session/table/form state is coupled enough that one frontend owner
should land the slice.

## Verification Plan

Before Wave 3 is complete:

- [x] Relevant frontend requirement files were read.
- [x] `POST /auth/login` is wired into the login UI.
- [x] Auth token is persisted and can be cleared by logout.
- [x] Auth failures return the user to login or show a clear session error.
- [x] Patients table supports search, sort, pagination, loading, empty, error,
  and retry states.
- [x] Details view is available for admin and user roles.
- [x] Create/edit form validates all required patient fields client-side.
- [x] Admin-only actions are hidden or disabled for users.
- [x] Backend remains authoritative for mutations.
- [x] Local browser integration path is documented in code/config without
  committed secrets.
- [x] Mobile layout remains usable.
- [x] `rtk bun --filter @care-desk/web typecheck` passes.
- [x] `rtk bun --filter @care-desk/web test` passes with helper and
  workflow-decision coverage.
- [x] No real credentials, real patient data, `.env*` contents, or production
  mutations are introduced.

Additional build evidence:

- `rtk bun --filter @care-desk/web build` failed in the sandbox because
  Turbopack attempted process/port work while processing `app/globals.css`.
- The same build passed with sandbox escalation, confirming the failure was an
  environment restriction rather than a frontend code issue.

Additional local smoke evidence:

- API dev server starts on `http://localhost:3001` with sandbox escalation.
- Web dev server starts on `http://127.0.0.1:3000` with sandbox escalation.
- `rtk curl -sS -I http://127.0.0.1:3000` returns `200 OK`.
- API CORS preflight from `http://127.0.0.1:3000` to `/patients` returns
  `204 No Content` with `Access-Control-Allow-Origin`,
  `Access-Control-Allow-Methods`, and `Access-Control-Allow-Headers`.

Additional workflow-test evidence:

- `apps/web/test/workflow.test.ts` covers session readiness to login/patient
  view selection, admin/user mutation-control decisions, sort query updates,
  total-page calculation, and retry visibility.

## Exit Criteria

Wave 3 is complete when a reviewer can run the web app against the local API and
exercise admin and user patient workflows with visible loading, error, empty,
validation, detail, and role states.

## Intentional Non-Goals

- No optimistic rollback implementation.
- No simulated random latency/failure.
- No generated shadcn/ui components.
- No browser E2E automation or screenshot matrix.
- No production identity provider.
- No cloud deployment.
