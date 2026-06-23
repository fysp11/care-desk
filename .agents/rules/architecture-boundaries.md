# Architecture boundaries

## Responsibility model

Classify code by responsibility rather than directory name.

### Presentation

Examples:

- components;
- views;
- templates;
- presentation formatting;
- browser interaction;
- UI-only state.

Presentation may call application-facing interfaces.

Presentation must not:

- implement business invariants;
- access databases;
- invoke persistence clients;
- perform multi-step business workflows;
- import infrastructure internals.

### Transport

Examples:

- HTTP routes;
- controllers;
- resolvers;
- RPC handlers;
- server actions;
- message consumers.

Transport code may:

- authenticate transport requests;
- validate transport input;
- map transport data;
- delegate to an application use case;
- translate results and errors into transport responses.

Transport code must not:

- implement business decisions;
- contain raw persistence queries;
- coordinate substantial workflows;
- expose infrastructure representations as public contracts.

### Application

Application code:

- executes use cases;
- coordinates domain objects and ports;
- defines transaction or workflow boundaries;
- expresses application-level authorization decisions;
- returns explicit outcomes.

Application code should depend on abstractions for external side effects.

### Domain

Domain code owns:

- business invariants;
- policies;
- calculations;
- state transitions;
- domain-specific errors;
- domain terminology.

Domain code must remain independent of:

- UI frameworks;
- web frameworks;
- persistence libraries;
- database schemas;
- network clients;
- vendor SDKs;
- transport-specific DTOs.

### Infrastructure

Infrastructure code:

- implements persistence ports;
- calls external systems;
- translates vendor representations;
- handles implementation-specific retries and serialization;
- contains framework and database integration details.

Infrastructure must not become the source of business truth.

## Dependency direction

Prefer:

```text
presentation ─┐
transport ────┼──> application ───> domain
infrastructure┘          │
                         ports
```

Infrastructure implements ports defined at a stable inward boundary.

Do not introduce an interface merely to satisfy a diagram. An abstraction must
provide at least one of:

- dependency inversion;
- a meaningful test seam;
- multiple implementations;
- isolation from a volatile external dependency;
- a stable cross-module contract.

## Feature boundaries

- A feature exposes an intentional public API.
- Other features must not import private implementation paths.
- Shared code must be genuinely shared and stable.
- Prefer duplication of trivial syntax over a misleading generic abstraction.
- Consolidate duplicated domain knowledge even when its syntax differs.
