# Verification policy

## Discover before running

Discover the repository's existing commands from:

- package manifests;
- workspace configuration;
- build files;
- Makefiles;
- task runners;
- CI workflows;
- applicable `AGENTS.md` files.

Do not invent commands when the repository already defines them.

## Required verification categories

Run all relevant available checks:

- focused unit tests;
- broader unit tests;
- integration tests;
- end-to-end tests;
- type checking;
- linting;
- formatting validation;
- production build;
- dependency-cycle checks;
- module-boundary checks;
- dead-code detection;
- static analysis.

## Architectural verification

Confirm:

- no forbidden cross-layer import was added;
- no new circular dependency exists;
- domain modules remain framework-independent;
- presentation does not access persistence;
- routes and controllers delegate workflows;
- duplicate business rules were removed;
- extracted modules have explicit ownership;
- old implementations and exports were removed;
- tests exercise behavior through stable boundaries.

## Failure reporting

For each failed or unavailable check, report:

- command;
- result;
- whether failure existed before the change;
- whether it blocks completion;
- concrete remediation required.

Never report an unexecuted check as passing.
