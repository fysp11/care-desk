# Refactoring safety

## Behavior preservation

Architectural refactoring must preserve externally observable behavior unless a
behavior change is explicitly included in the task.

Preserve where applicable:

- API contracts;
- error semantics;
- authorization behavior;
- transaction boundaries;
- persistence semantics;
- event ordering;
- idempotency;
- UI state transitions;
- loading and error states;
- accessibility behavior;
- public imports.

## Characterization before modification

Before changing poorly protected behavior:

1. identify the existing observable contract;
2. add characterization tests at the narrowest stable boundary;
3. confirm the tests pass before the refactor;
4. refactor;
5. confirm the same tests still pass.

Do not encode an obvious bug as intended behavior without documenting it.

## Batch constraints

Each refactoring batch should:

- have one architectural objective;
- remain reviewable;
- keep the application buildable;
- avoid unrelated formatting churn;
- remove the superseded implementation;
- include its verification evidence.

Do not leave both old and new paths active unless the migration explicitly
requires coexistence.

## Extraction sequence

When extracting a responsibility:

1. describe its input, output, invariants, and side effects;
2. choose its owning module;
3. establish tests around the stable behavior;
4. move pure logic first;
5. isolate side effects behind explicit boundaries;
6. update callers;
7. remove duplicate implementations;
8. run focused checks;
9. run broader regression checks.

## Prohibited shortcuts

Do not:

- weaken types;
- use `any`, untyped dictionaries, or generic payloads to bypass design work;
- swallow errors;
- change public behavior silently;
- create hidden global state;
- add compatibility shims without an owner and removal condition;
- leave TODOs as substitutes for completing the migration;
- claim success while relevant checks fail.
