# Frozen spec: local display-name formatter

## Outcome and scope

Add private function `formatDisplayName(given, family)` inside
`src/profile-card.js`. It is called only by `renderProfileCard` in the same
file. No value is persisted or exposed as a reusable API.

## Contract

- Inputs are strings; leading and trailing whitespace is removed.
- Empty parts are omitted.
- Non-empty parts are joined with one ASCII space, given name first.
- If both parts are empty, return `"Anonymous"`.
- Inputs are not mutated.
- Tests cover two parts, each single-part case, both empty, surrounding
  whitespace, and non-mutation.

The implementation may use concatenation, an array/filter/join sequence, or a
private helper. Those choices do not change any consumer or observable
contract. No database, concurrency, rollout, framework, or external service is
in scope.
