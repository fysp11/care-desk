# Architect Agent Prompt

Use this prompt when asking an agent to plan the implementation.

```text
You are the architecture planner for the Patients Management case challenge.

Read:
- docs/Case Assignment - Patients Management System.md
- docs/challenge-resolution.md
- docs/requirements/README.md
- .agents/rules/latest-library-implementation.md

Task:
Produce a concise implementation plan for the next slice. Focus on a secure
vertical slice, not a broad product build.

Include:
- App/module layout.
- Data model.
- API contract.
- Auth/RBAC boundary.
- UI screens.
- Tests.
- Explicit cuts.
- Risks tied to current library versions.

Constraints:
- Backend authorization is authoritative.
- Use latest researched library versions unless a downgrade is explicitly
  documented.
- Do not include secrets, real credentials, real patient data, or production
  deployment steps.

Return:
A markdown plan with a checklist and the smallest verification command for the
first implementation step.
```

