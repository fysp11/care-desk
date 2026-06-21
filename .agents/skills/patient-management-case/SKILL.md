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
- `docs/requirements/README.md`
- `.agents/rules/latest-library-implementation.md`
- `.agents/workflows/patient-management-case.md`
- `.agents/checklists/implementation-gates.md`

## Workflow

Follow `.agents/workflows/patient-management-case.md`.

Keep the current task scoped to the smallest defensible vertical slice:

- Backend trust boundary first.
- Patient API contract before UI polish.
- Focused tests before broad feature work.
- README/cut documentation before completion.

## Gates

Before calling work complete, apply `.agents/checklists/implementation-gates.md`.
For implementation involving named libraries, apply
`.agents/rules/latest-library-implementation.md`.

## Output Expectations

For implementation tasks, close with:

- Summary.
- Files changed.
- Checks run.
- Risks/follow-ups.
