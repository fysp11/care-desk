# Wave 5: Delivery Defense

## Decision

Wave 5 turns the implemented slice into something reviewable: accurate README
instructions, verification evidence, known cuts, and interview-defense notes.
It should not add new product behavior.

The goal is that a reviewer can clone the repository, run the local apps, run
the relevant checks, and understand which tradeoffs are intentional.

## Implementation Status

Status: implemented; final reviewer approval remains the handoff step.

The README now documents:

- Bun/Node prerequisites and the root workspace commands.
- Local API and web ports.
- Public demo login fixtures.
- Shipped auth, RBAC, patient API, frontend validation, and reliability scope.
- Verification evidence from Waves 1-4, including the Wave 4 build sandbox
  blocker.
- Known cuts and concise interview-defense notes.

## Source Alignment

| Source | Applied here |
|---|---|
| `docs/roadmap.md` | Phase 5: README, verification evidence, known cuts, interview defense notes. |
| `docs/challenge-resolution.md` | Explains the small production-shaped slice and cuts. |
| `.agents/workflows/patient-management-case.md` | Reserve final pass for checks, README instructions, and cut documentation. |
| `.agents/checklists/implementation-gates.md` | Delivery, verification, and privacy gates apply. |
| `.agents/agents/reviewer.md` | Reviewer should validate clone/run/test clarity and challenge-defense gaps. |

## Scope

### Included

- Rewrite `README.md` from scaffold status to actual delivery status.
- Document local setup, run, login credentials, and test commands.
- Document API/web ports and CORS/local-only simulation behavior.
- Record verification evidence from Waves 0-4.
- Document known cuts and next hardening steps.
- Add concise interview-defense notes for RBAC, validation, persistence,
  reliability, and AI-assisted ownership.
- Ensure documentation does not contain real secrets, real patient data,
  `.env*` contents, or host-specific reusable paths.

### Deferred

- New application features.
- Production deployment docs beyond explicit optional cut.
- Cloud hosting or Docker setup unless Wave 6 chooses them.
- Broad architecture prose that duplicates existing docs.

## Work Items

| Status | Task | Owner artifact | Notes |
|---|---|---|---|
| Done | Update README run/test/setup instructions. | Docs worker | Matches root package scripts and documented local ports. |
| Done | Add verification evidence. | Docs worker | Includes API/web test and typecheck evidence plus the build blocker boundary. |
| Done | Document shipped scope and cuts. | Docs worker | Reflects the in-memory patient repository and PostgreSQL/Prisma next step. |
| Done | Add interview-defense notes. | Docs worker | Covers RBAC, validation, persistence, reliability, and AI-assisted ownership. |
| Done | Run documentation sanity checks. | Docs worker | Grep checked for stale README scaffold/deferred wording. |

## Verification Plan

Before Wave 5 is complete:

- [x] README setup/run/test commands match `package.json` scripts.
- [x] README describes shipped auth, patient API, UI, and reliability behavior.
- [x] README documents demo credentials as public fixtures only.
- [x] README documents build sandbox blocker and current verification evidence.
- [x] Known cuts include PostgreSQL/Prisma persistence, production secrets,
  browser E2E matrix, cloud hosting, and audit/soft-delete hardening.
- [x] No stale wording says patient endpoints are still deferred.
- [x] No real credentials, real patient data, `.env*` contents, or
  host-specific reusable paths are introduced.
- [ ] Reviewer approves delivery-defense docs.

## Exit Criteria

Wave 5 is complete when the README and supporting wave docs let a reviewer run
and defend the implementation without relying on chat history.

## Intentional Non-Goals

- No new app code.
- No deployment.
- No Docker/PostgreSQL implementation.
- No broad browser automation.
