# Agent Role Cards

## Purpose

These role cards define how to scope specialized subagents for this repo. They
are not global agent definitions; they are local contracts for the Patients
Management case challenge.

## Available Roles

| Role | Use When | Card |
|---|---|---|
| Architect | Planning the next implementation slice or resolving tradeoffs | [architect.md](architect.md) |
| Backend | Implementing auth, RBAC, API, database, validation, or tests | [backend.md](backend.md) |
| Frontend | Implementing Next.js UI, forms, state, styling, or accessibility | [frontend.md](frontend.md) |
| Reviewer | Reviewing correctness, security, UX, tests, and challenge defense | [reviewer.md](reviewer.md) |

## Dispatch Guidance

- Give each agent one bounded scope.
- Give agents only the files they need.
- Do not assign overlapping write sets to parallel implementation agents.
- Always run reviewer passes on auth/RBAC, validation, and generated UI code.

