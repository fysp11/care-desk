# Verification workflow

## Behavioral checks

Verify the preserved behavior at stable boundaries.

For frontend changes, consider:

- loading;
- empty;
- success;
- error;
- validation;
- retry;
- disabled;
- optimistic-update;
- accessibility states;
- server/client boundaries.

For backend changes, consider:

- input validation;
- authentication;
- authorization;
- domain invariants;
- transactions;
- idempotency;
- concurrency;
- persistence failure;
- external-service failure;
- error mapping.

## Structural checks

Inspect:

- dependency cycles;
- forbidden imports;
- feature-internal imports;
- domain dependencies on frameworks;
- transport dependencies on persistence;
- remaining duplicated rules;
- dead exports;
- old migration paths;
- module APIs that expose infrastructure details.

## Compare against plan

For every planned batch, classify:

- complete;
- partially complete;
- not implemented;
- intentionally changed.

Do not interpret tests passing as proof that the architecture is correct.

## Verification report

Report:

- commands and outcomes;
- structural checks;
- contract checks;
- unresolved failures;
- remaining risks;
- completion recommendation.
