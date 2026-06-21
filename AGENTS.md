# Care Desk Agent Instructions

## Purpose

This repository is for the Patients Management case challenge. Agents should
optimize for a small production-shaped vertical slice with real backend trust
boundaries, clear UI states, focused tests, and documented cuts.

## Start Here

Before implementation work, read:

1. `docs/challenge-resolution.md`
2. `docs/requirements/README.md`
3. `.agents/README.md`
4. `.agents/rules/latest-library-implementation.md`

For role-specific work, use the matching artifact under `.agents/agents/`.
Each role card includes a copyable dispatch prompt.

## Delegation

When working on a specific task from a roadmap phase/wave, prefer scoped
subagents for context management:

- Start with `.agents/agents/architect.md` for non-trivial phase planning or
  tradeoffs before implementation.
- Delegate backend, frontend, and review work to the matching role cards under
  `.agents/agents/`.
- Give each subagent one bounded task, the smallest relevant files, and the
  matching phase/wave file; avoid dumping the full repository context.
- Run independent backend/frontend/docs/test tasks in parallel when their write
  sets do not overlap and the API or contract boundary is clear.
- Do not run parallel implementation agents against the same files or unresolved
  contracts; settle the contract first, then split work.
- Use reviewer passes for auth/RBAC, validation, generated UI, and any slice
  that claims completion.
- Synthesize subagent outputs in the main thread, then run the repo's smallest
  relevant verification command before reporting completion.

## Work Classification

| Risk | Examples | Default behavior |
|---|---|---|
| Low | docs, agent artifacts, tests, lint/type fixes | Edit directly when scope is clear. |
| Medium | backend/API, UI, auth mocks, database schema, internal tools | Inspect, plan briefly, implement, verify. |
| High | real secrets, production data, deployments, cloud resources, destructive DB work | Read-only first; wait for explicit approval before mutations. |

## Project Guardrails

- Backend authorization is authoritative; frontend role gating is UX only.
- Use the latest researched library versions in `docs/requirements/` unless a
  downgrade is documented as a tradeoff.
- Keep implementation centered on the 3-4 hour case: auth/RBAC, patients list
  and CRUD, validation, error semantics, responsive UI, and focused tests.
- Do not add real patient data, real credentials, production secrets, or
  host-specific absolute paths to reusable docs or code.
- Prefer concise documentation and clear cuts over broad unfinished features.

## Verification

Run the smallest relevant check first:

- `bun test`
- `bun run typecheck`
- targeted API/UI tests once they exist

If a check cannot run, state why and document the residual risk.
