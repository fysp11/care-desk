# Refactoring workflow

## Before editing

1. Identify the exact responsibility being moved.
2. State its current and target owner.
3. Confirm the observable behavior to preserve.
4. Inspect tests protecting that behavior.
5. Add characterization coverage when protection is insufficient.
6. Define the smallest verifiable batch.

## During editing

- Move one cohesive responsibility at a time.
- Prefer pure extraction before introducing dependency inversion.
- Keep side effects explicit.
- Preserve strong types.
- Maintain public contracts unless change is requested.
- Update callers in the same batch.
- Delete obsolete implementations.
- Avoid broad rename or formatting churn.
- Do not create a generic abstraction until concrete call sites demonstrate the
  shared concept.

## After each batch

1. inspect the diff;
2. run focused tests;
3. run type checking and linting;
4. run affected integration tests;
5. inspect dependency direction;
6. confirm no duplicate implementation remains;
7. confirm the source file now has fewer responsibilities, not merely fewer
   lines.

## Stop conditions

Stop and report rather than continuing blindly when:

- existing behavior cannot be determined;
- tests reveal conflicting expectations;
- the proposed boundary breaks a public contract;
- transaction or authorization semantics are unclear;
- required infrastructure cannot be executed;
- the next step would expand the change beyond a reviewable batch.

Provide the safest completed batch and the evidence needed for the next step.
