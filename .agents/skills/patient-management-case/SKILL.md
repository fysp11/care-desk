---
name: patient-management-case
description: Use when planning, implementing, reviewing, or documenting the Patients Management case challenge. This skill keeps work scoped to a defensible auth/RBAC, patient CRUD, validation, UI-state, and verification slice.
---

# Patient Management Case Skill

## When To Use

Use this skill for any task that changes implementation, tests, or docs for the
Patients Management case challenge.

## Read First

- `docs/Case Assignment - Patients Management System.md`
- `docs/challenge-resolution.md`
- `.agents/rules/latest-library-implementation.md`
- `.agents/checklists/implementation-gates.md`

## Workflow

1. Classify the task risk.
2. Identify the smallest vertical slice.
3. Protect backend trust boundaries first.
4. Add UI only after the API contract is clear.
5. Add focused tests for risky behavior.
6. Document cuts before claiming completion.

## Default Slice Order

1. Seeded auth with admin/user.
2. Login endpoint and token expiry.
3. Auth guard and role guard.
4. Patient list/create/update/delete API.
5. Patient table and form.
6. Failure states and rollback behavior.
7. README setup and cuts.

## Output Expectations

For implementation tasks, close with:

- Summary.
- Files changed.
- Checks run.
- Risks/follow-ups.

