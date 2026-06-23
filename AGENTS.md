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

For Codex-native execution, use `.codex/agents/*.toml` for concrete subagent spawning and `.agents/agents/*.md` for human-readable role context.

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

- Preferred Codex workflow for non-trivial changes:
  1. Spawn `repo_explorer` to map impact and call paths.
  2. Spawn `test_auditor` to identify minimal guardrail tests.
  3. Spawn `implementer` for the smallest viable patch.
  4. Spawn `reviewer` to verify correctness, auth boundaries, and residual risk.
  5. Report results with explicit cuts and next steps.

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

## Architecture invariants

- Assign every behavior to one primary architectural responsibility.
- Keep NestJS API code feature-first by default. Feature-specific controllers,
  services, DTOs, guards, decorators, repositories, and types should live under
  the owning module folder, not global layer-first folders.
- Do not mix presentation, transport, application orchestration, domain logic,
  persistence, and external integrations in the same module.
- Domain code must not import UI frameworks, HTTP frameworks, databases,
  persistence clients, or external-service SDKs.
- UI code must not implement domain policy or access persistence directly.
- Route/page components should compose views and delegate workflow/state; do not
  concentrate fetching, validation, auth policy, mutation orchestration, and
  rendering in a single page.
- Hooks should own cohesive interaction workflows, not become unbounded service
  containers. Extract query, selection, mutation, and confirmation concerns when
  they gain unrelated reasons to change.
- Routes, controllers, resolvers, and server actions validate/adapt transport
  input, delegate execution, and translate results.
- Application use cases orchestrate workflows; infrastructure implements
  persistence and external-integration boundaries.
- Dependencies must point toward stable domain and application abstractions.
- Preserve public behavior and contracts unless the task explicitly changes them.

## Refactoring invariants

- Do not split files solely to reduce line count.
- Every extraction must create cohesive ownership and a meaningful API.
- Do not introduce speculative abstractions or unnecessary architectural layers.
- Add characterization tests before modifying insufficiently protected behavior.
- Refactor incrementally in independently verifiable batches.
- Do not combine broad architectural refactoring with unrelated feature changes.

## Architecture routing

Invoke the `architecture` skill for oversized or high-complexity modules, mixed
responsibilities, misplaced frontend/backend/domain/persistence logic, invalid
dependencies, duplicated business rules, helper dumping grounds, repository-wide
refactoring, architectural planning, or architectural review.

The architecture skill must select exactly one initial mode: audit, plan,
refactor, verify, or review.

## Verification

Run the smallest relevant check first:

- `bun test`
- `bun run typecheck`
- targeted API/UI tests once they exist

Before declaring production-code work complete, also run linting, production
builds, dependency checks, and architecture checks when available. Report checks
that were unavailable or could not be executed. Do not claim that rules were
enforced merely because they were written here; prefer deterministic repository
checks whenever a rule can be automated.

If a check cannot run, state why and document the residual risk.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **care-desk** (3523 symbols, 6028 relationships, 118 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> Index stale? Run `node .gitnexus/run.cjs analyze` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? `npx gitnexus analyze` (npm 11 crash → `npm i -g gitnexus`; #1939).

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user. For unified PDG impact, add `mode: "pdg"` with optional `line: <N>` — it returns statement-level `affectedStatements` over CDG + REACHING_DEF and inter-procedural symbols in `interproceduralByDepth`/`byDepth`; no-layer/degraded PDG results are UNKNOWN-risk notes (`--pdg` layer).
- **MUST run `detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows. For regression review, compare against the default branch: `detect_changes({scope: "compare", base_ref: "main"})`.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `query({search_query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `context({name: "symbolName"})`.
- For security review, `explain({target: "fileOrSymbol"})` lists taint findings (source→sink flows; needs `analyze --pdg`).
- For control/data dependence, `pdg_query({mode: "controls", target: "fileOrSymbol"})` answers "under what condition does X run?" (CDG, incl. guard clauses) and `pdg_query({mode: "flows", target, variable})` traces "where does variable Y flow?" (REACHING_DEF). `--pdg` layer.

## Never Do

- NEVER edit a function, class, or method without first running `impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit changes without running `detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/care-desk/context` | Codebase overview, check index freshness |
| `gitnexus://repo/care-desk/clusters` | All functional areas |
| `gitnexus://repo/care-desk/processes` | All execution flows |
| `gitnexus://repo/care-desk/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
