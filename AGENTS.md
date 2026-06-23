# Agent operating contract

## Architecture invariants

- Assign every behavior to one primary architectural responsibility.
- Do not mix presentation, transport, application orchestration, domain logic,
  persistence, and external integrations in the same module.
- Domain code must not import UI frameworks, HTTP frameworks, databases,
  persistence clients, or external-service SDKs.
- UI code must not implement domain policy or access persistence directly.
- Routes, controllers, resolvers, and server actions must validate and adapt
  transport input, delegate execution, and translate results.
- Application use cases orchestrate workflows.
- Infrastructure implements persistence and external-integration boundaries.
- Dependencies must point toward stable domain and application abstractions.
- Preserve public behavior and contracts unless the task explicitly changes them.

## Refactoring invariants

- Do not split files solely to reduce line count.
- Every extraction must create cohesive ownership and a meaningful API.
- Do not introduce speculative abstractions or unnecessary architectural layers.
- Do not add behavior to an already mixed-responsibility file without first
  considering extraction.
- Add characterization tests before modifying insufficiently protected behavior.
- Refactor incrementally in independently verifiable batches.
- Do not combine broad architectural refactoring with unrelated feature changes.

## Architecture routing

Invoke the `architecture` skill when work involves any of the following:

- oversized or high-complexity modules;
- mixed responsibilities;
- misplaced frontend, backend, domain, or persistence logic;
- circular or invalid dependencies;
- duplicated business rules;
- generic helper or service dumping grounds;
- repository-wide or cross-module refactoring;
- architectural planning or review.

The architecture skill must select the appropriate operating mode:

- audit;
- plan;
- refactor;
- verify;
- review.

## Completion requirements

Before declaring production-code work complete:

- run the relevant tests;
- run type checking;
- run linting;
- run the production build when available;
- run dependency and architecture checks when configured;
- report commands that were not available or could not be executed;
- leave no temporary migration code, dead code, or unexplained duplication.

Do not claim that rules were enforced merely because they were written here.
Prefer deterministic repository checks whenever a rule can be automated.
