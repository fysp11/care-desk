# Audit workflow

## Scope

Establish the requested scope. If no scope is specified, inspect:

1. the files relevant to the current task;
2. their direct dependencies and dependents;
3. the nearest feature or package boundary;
4. repository-wide patterns only when evidence indicates systemic damage.

Avoid scanning and redesigning the entire repository by default.

## Evidence collection

Collect evidence for:

- module responsibilities;
- dependency direction;
- imports across layers or features;
- file and function complexity;
- duplicated business knowledge;
- direct infrastructure access;
- hidden side effects;
- mutable global state;
- circular dependencies;
- generic dumping-ground modules;
- missing or brittle tests;
- frequently co-changing modules when history is available.

## Issue format

For every material finding, report:

| Field | Required content |
|---|---|
| Location | Exact file, symbol, or module |
| Evidence | Concrete imports, responsibilities, or behavior |
| Smell | Specific architectural problem |
| Consequence | Why future change is harder or riskier |
| Target owner | Module or layer that should own the behavior |
| Severity | Critical, high, medium, or low |
| Confidence | High, medium, or low |
| Risk | Refactoring risk |
| Verification | Tests or checks needed |

## Severity

### Critical

- security or authorization logic is misplaced or bypassable;
- data-integrity or transaction behavior is unsafe;
- circular dependency blocks reliable change;
- multiple conflicting implementations of a core invariant exist.

### High

- business logic is coupled to UI, transport, or persistence;
- a central module owns many unrelated workflows;
- cross-feature internals are extensively imported;
- side effects cannot be isolated or tested.

### Medium

- complexity or duplication makes changes error-prone;
- boundaries exist but are inconsistently followed;
- unclear ownership produces repeated navigation or coordination cost.

### Low

- naming, organization, or minor coupling reduces clarity without an immediate
  correctness risk.

## Audit output

Conclude with:

1. current responsibility map;
2. top three remediation priorities;
3. issues that should not be changed;
4. recommended next mode: plan, refactor, or no action.
