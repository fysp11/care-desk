# Architecture review workflow

Review adversarially. Do not defend the implementation merely because it is
functional.

## Review questions

- Did any module gain an additional reason to change?
- Was logic moved to its correct owner or merely relocated?
- Did the change create pass-through layers?
- Did UI or transport gain business decisions?
- Did domain code gain framework dependencies?
- Did infrastructure become the source of business truth?
- Were duplicate rules consolidated?
- Are feature internals imported externally?
- Are new abstractions justified by current behavior?
- Are errors and side effects explicit?
- Do tests protect behavior rather than implementation details?
- Was temporary migration code removed?
- Can the new design be extended without editing unrelated modules?

## Finding format

For each finding:

- severity;
- exact location;
- violated rule;
- consequence;
- recommended correction;
- whether it blocks merging.

## Merge recommendation

Return exactly one recommendation:

- `APPROVE`;
- `APPROVE WITH FOLLOW-UP`;
- `REQUEST CHANGES`.

A blocking finding must be based on concrete architectural or behavioral risk,
not stylistic preference.
