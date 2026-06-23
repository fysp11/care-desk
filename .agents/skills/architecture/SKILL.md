---
name: architecture
description: Audit, plan, refactor, verify, or review software architecture. Use when files are oversized, responsibilities are mixed, dependencies cross architectural boundaries, business logic is misplaced, modules are tightly coupled, logic is duplicated, or the user requests modularization, architecture cleanup, decomposition, or structural refactoring. Do not trigger for a small isolated edit with no structural implications.
---

# Architecture router

Use this skill to improve responsibility ownership and dependency direction, not
merely to create smaller files.

## Initialization

Before choosing a mode:

1. Read the repository's `AGENTS.md` files applicable to the target paths.
2. Read:
   - `.agents/rules/architecture-boundaries.md`
   - `.agents/rules/decomposition.md`
   - `.agents/rules/refactoring-safety.md`
   - `.agents/rules/verification.md`
3. Inspect repository conventions, package boundaries, build configuration,
   tests, and existing architectural patterns.
4. Inspect the current working tree before editing.
5. Do not assume the repository follows Clean Architecture, DDD, hexagonal
   architecture, MVC, CQRS, or another named pattern.
6. Prefer the repository's existing coherent conventions.
7. Introduce a new pattern only when it solves an evidenced problem.

## Mode selection

Select exactly one initial mode.

### `audit`

Use when the user asks to:

- inspect architecture;
- detect antipatterns;
- identify large or mixed-responsibility files;
- assess coupling or dependency direction;
- recommend improvements without requesting implementation.

Read `references/audit.md`.

Do not modify production code in this mode.

### `plan`

Use when the user asks for:

- a target architecture;
- a refactoring proposal;
- a migration sequence;
- module or package boundaries;
- approval before implementation.

Read `references/plan.md`.

Do not modify production code unless explicitly instructed.

### `refactor`

Use when the user requests implementation of architectural improvements.

Read `references/refactor.md`.

For non-trivial work, perform an abbreviated audit and plan before editing. Do
not execute a repository-wide rewrite as one batch.

### `verify`

Use when structural changes already exist and the primary task is validating
their correctness, dependency direction, or completeness.

Read `references/verify.md`.

### `review`

Use when inspecting a diff, branch, pull request, or completed refactor for
architectural regressions.

Read `references/review.md`.

Do not modify production code unless the user explicitly requests fixes.

## Escalation sequence

For large refactors, use this internal sequence:

1. audit;
2. plan;
3. refactor one batch;
4. verify;
5. review;
6. repeat only for the next justified batch.

Do not jump from repository discovery directly to broad implementation.

## Priority order

Optimize in this order:

1. preserved correctness;
2. domain invariant integrity;
3. responsibility ownership;
4. valid dependency direction;
5. testability;
6. operational safety;
7. understandability;
8. reduced complexity;
9. reduced file size.

File count and line count are not architecture objectives.

## Required final report

Report:

1. selected mode;
2. evidence inspected;
3. issues or changes by responsibility;
4. files changed;
5. dependency-direction changes;
6. tests or checks executed;
7. remaining risks;
8. deferred work and why it was deferred.
