# Patient Management Case Workflow

## Goal

Ship a compact, production-shaped patient-management slice that proves:

- Authentication and token expiry.
- Server-side RBAC.
- Patient CRUD and list behavior.
- Validation and error semantics.
- Usable role-aware UI.
- Focused tests and documented cuts.

## Inputs

Read before starting:

- `docs/Case Assignment - Patients Management System.md`
- `docs/challenge-resolution.md`
- `docs/requirements/README.md`
- `.agents/rules/latest-library-implementation.md`

## Risk Level

Medium once implementation begins:

- Backend/API, auth, persistence, and UI behavior are in scope.
- Production deployment, real secrets, real PII, and destructive database work
  remain out of scope unless explicitly approved.

## Phases

### 1. Orient

- Confirm the current package/workspace shape.
- Confirm package manager and scripts.
- Confirm whether implementation already exists or must be scaffolded.
- Identify the smallest meaningful verification command.

### 2. Plan

Produce a short plan with:

- App layout.
- Data model.
- API contract.
- Auth/RBAC behavior.
- UI screens.
- Tests.
- Explicit cuts.

Do not begin coding a broad slice without this plan.

### 3. Implement Backend First

Priority order:

1. Seeded admin/user credentials with hashed passwords.
2. Login endpoint and JWT expiry.
3. Auth guard and role guard.
4. Patient model, validation DTOs, and repository/service layer.
5. Patient endpoints with `401`, `403`, `400`, `404`, and `409` behavior.
6. API integration tests for admin create and user forbidden mutation.

### 4. Implement Frontend

Priority order:

1. Login page and auth state.
2. Protected patients route.
3. Table with search, sort, pagination, loading, empty, and error states.
4. Create/edit form with client validation.
5. Details view.
6. Role-gated actions with server-side enforcement still authoritative.

### 5. Add Failure Behavior

- Add dev-only latency/failure simulation if time allows.
- Implement optimistic edit/delete rollback only where tested or manually
  verified.
- Normalize error display so auth, validation, and server failures are clear.

### 6. Verify

Run the smallest relevant checks first:

- Typecheck.
- Backend API tests.
- Frontend component or route smoke tests.
- Manual run-through of admin and user roles.

Broaden only if needed.

### 7. Document Cuts

README must explain:

- What was shipped.
- How to run it.
- How to test it.
- Which requirements were intentionally cut.
- Next hardening steps.

## Stop Rules

Stop feature work when:

- Core backend trust boundary is unverified.
- Auth/RBAC behavior is unclear.
- Tests are failing without a known root cause.
- The remaining time is better spent on verification and README cuts.

