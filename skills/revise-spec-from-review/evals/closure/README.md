# Closure evals

Grade the **updated spec cluster** after `revise-spec-from-review`, not claims
that a sweep or reread occurred.

## How to run

1. Clean session. Provide the fixture `input/` (review findings, task contract,
   spec folder).
2. Invoke `revise-spec-from-review`.
3. Score `cases.json` checks against the resulting spec files. Assertions that
   would pass for a clearly wrong edit (e.g. only renaming a heading) are
   invalid checks — prefer discriminating outcome checks already listed.

`local-only-dependency-entry` encodes a real recovery-spec failure mode: gate
prose reorder without making local-only paths provider-free.

Latest graded run for that case: `cold-eval-results.json` (artifact under
`runs/`).
