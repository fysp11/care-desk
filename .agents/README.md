# Agentic Artifacts

## Purpose

This directory stores repo-local guidance for AI-assisted implementation of the
Patients Management case challenge.

The convention is intentionally small:

- Keep broad project instructions short and stable.
- Put reusable agent rules in `rules/`.
- Put task flows in `workflows/`.
- Put verification gates in `checklists/`.
- Put scoped delegation cards and copyable dispatch prompts in `agents/`.

## Research Summary

There is no single universal `.agents/` standard. Current practice is centered
around repository-level context files such as `AGENTS.md`, `CLAUDE.md`, and
similar agent READMEs. Research on agent context files points to two useful
constraints for this repo:

1. Agent instructions should stay minimal and task-relevant to avoid context
   bloat and conflicting instructions.
2. Guardrails should cover not only build commands and architecture, but also
   security, reliability, performance, and verification.

For this project, `.agents/` is a local artifact namespace that keeps heavier
workflow details out of the root README while making them easy for agents to
discover.

## Research Sources

- [Configuring Agentic AI Coding Tools](https://arxiv.org/abs/2602.14690):
  context files dominate repository configuration, with `AGENTS.md` emerging as
  an interoperable standard while skills and subagents are usually shallowly
  adopted.
- [Configuration Smells in AGENTS.md Files](https://arxiv.org/abs/2606.15828):
  common risks include context bloat, skill leakage, lint leakage, and
  conflicting instructions.
- [On the Use of Agentic Coding Manifests](https://arxiv.org/abs/2509.14744):
  observed manifests tend to use shallow hierarchies and focus on commands,
  implementation notes, architecture, and workflow guidance.

## Directory Map

| Path | Purpose |
|---|---|
| `agents/` | Role cards for scoped subagent delegation, each with a copyable dispatch prompt. |
| `skills/` | Repo-local skill definitions for recurring workflows. |
| `rules/latest-library-implementation.md` | Guard against stale library APIs and unsafe generated code. |
| `workflows/patient-management-case.md` | End-to-end workflow for building the case challenge. |
| `checklists/implementation-gates.md` | Verification gates agents must satisfy before calling work done. |

## Use Policy

Use these artifacts when a task involves implementation, review, or planning.
Do not paste all artifacts into every agent context. Select the smallest one
that matches the task.

## Required Baseline

Before implementation work, read:

- `docs/challenge-resolution.md`
- `docs/requirements/README.md`
- `.agents/rules/latest-library-implementation.md`

For repeated workflows, prefer the smaller skill entrypoints under
`.agents/skills/`. For delegation, use `.agents/agents/` role cards.

Then select one workflow or role card from this directory if it matches the
task.
