# Agentic Artifacts

## Purpose

This directory stores repo-local guidance for AI-assisted implementation of the
Patients Management case challenge.

The convention is intentionally small:

- Keep broad project instructions short and stable.
- Put reusable agent rules in `rules/`.
- Put task flows in `workflows/`.
- Put verification gates in `checklists/`.
- Put copyable specialist prompts in `prompts/`.

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

## Directory Map

| Path | Purpose |
|---|---|
| `rules/latest-library-implementation.md` | Guard against stale library APIs and unsafe generated code. |
| `workflows/patient-management-case.md` | End-to-end workflow for building the case challenge. |
| `checklists/implementation-gates.md` | Verification gates agents must satisfy before calling work done. |
| `prompts/architect.md` | Prompt for planning architecture and tradeoffs. |
| `prompts/backend-agent.md` | Prompt for backend/API/database implementation. |
| `prompts/frontend-agent.md` | Prompt for frontend/UI implementation. |
| `prompts/reviewer-agent.md` | Prompt for code review and challenge-defense review. |

## Use Policy

Use these artifacts when a task involves implementation, review, or planning.
Do not paste all artifacts into every agent context. Select the smallest one
that matches the task.

## Required Baseline

Before implementation work, read:

- `docs/challenge-resolution.md`
- `docs/requirements/README.md`
- `.agents/rules/latest-library-implementation.md`

Then select one workflow or prompt from this directory if it matches the task.

