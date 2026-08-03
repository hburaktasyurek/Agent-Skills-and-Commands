# Parser helper refactor

Goal: remove the duplicate private parser helper from two internal modules.

Boundaries and decisions:

- Preserve all public APIs, error types, messages, and serialized output.
- Move both callers to the existing shared `parseToken` helper; do not create a
  new abstraction.
- No data migration, dependency change, user-visible behavior, or external
  system action is in scope.
- The change is reversible in one commit.
- Acceptance: existing focused parser tests and the full unit suite pass, and
  the diff contains only the two callers plus removed duplicate helpers.
- Commit locally after review; do not push.

The repository convention already uses `parseToken` for equivalent modules.
There is no open product, risk, budget, timeline, or ownership decision.
