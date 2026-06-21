# Implementation Gates

Use this checklist before claiming an implementation slice is complete.

## Version Gate

- [ ] Read `.agents/rules/latest-library-implementation.md`.
- [ ] Read the relevant `docs/requirements/<requirement>.md` files.
- [ ] Used latest researched APIs or documented the downgrade.
- [ ] Avoided stale examples called out in requirement docs.

## Auth And RBAC Gate

- [ ] Login succeeds for seeded admin and user accounts.
- [ ] Missing or expired token returns `401`.
- [ ] Authenticated `user` mutation returns `403`.
- [ ] Frontend role gating is treated as UX only, not the security boundary.
- [ ] JWT algorithm and key behavior are explicit.

## Patient API Gate

- [ ] `GET /patients` supports page, limit, search, sortBy, and sortDir.
- [ ] `GET /patients/:id` returns a patient or `404`.
- [ ] `POST /patients` validates input and returns `201`.
- [ ] `PUT /patients/:id` validates input and returns updated patient.
- [ ] `DELETE /patients/:id` returns `{ ok: true }`.
- [ ] Errors follow a predictable `{ code, message, details? }` shape.

## Frontend Gate

- [ ] Login page has validation, loading, and auth-error states.
- [ ] Patients table has loading, empty, error, search, sort, and pagination.
- [ ] Patient form validates `firstName`, `lastName`, `email`, `phoneNumber`,
  and `dob`.
- [ ] Details view is accessible by admin and user roles.
- [ ] Admin-only actions are hidden or disabled for users.
- [ ] Focus states and validation states are visible.
- [ ] Mobile layout remains usable.

## Verification Gate

- [ ] Typecheck run.
- [ ] API integration tests run.
- [ ] UI smoke tests or manual browser verification run.
- [ ] README instructions validated against actual commands.
- [ ] Cuts documented.

## Privacy And Safety Gate

- [ ] No real patient data.
- [ ] No real credentials.
- [ ] No `.env*` contents exposed.
- [ ] No production deployment or cloud mutation without explicit approval.
- [ ] No host-specific absolute paths in reusable docs.

