# Planning workflow

Produce an implementable migration plan, not an aspirational architecture essay.

## Target architecture

Define:

- responsibility of each affected module;
- allowed dependency direction;
- public contracts;
- side-effect boundaries;
- ownership of validation and error translation;
- ownership of business invariants;
- testing seams.

Use existing repository terminology.

## Change inventory

For each batch, state:

- files to create;
- files to modify;
- files to remove;
- behavior preserved;
- dependency edges removed;
- dependency edges introduced;
- tests added or changed;
- validation commands;
- rollback boundary.

## Batch design

Prefer batches such as:

1. characterize current behavior;
2. extract pure domain behavior;
3. introduce an application-level workflow boundary;
4. move persistence or integrations behind that boundary;
5. simplify transport or presentation callers;
6. remove obsolete code;
7. encode dependency rules in tooling.

Each batch must be independently reviewable and verifiable.

## Architecture decision filter

Before introducing a layer or abstraction, answer:

1. What concrete problem does it solve?
2. Which dependency becomes safer?
3. Which responsibility gains a clear owner?
4. What testing seam does it create?
5. What complexity does it add?
6. Why is a simpler extraction insufficient?

Reject the abstraction when these answers are weak.

## Planning output

Include:

- current-state diagram;
- target-state diagram;
- ordered batches;
- risks;
- verification matrix;
- deferred issues;
- explicit non-goals.
