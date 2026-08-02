# Incremental-closure evals

Grade the **report artifact** from an incremental `adversarial-spec-review`
run on each fixture. Do not grade claimed reading order or checklist prose.

## How to run

1. Clean session. Provide the fixture `input/` (task, prior-report when
   present, `spec/`).
2. Invoke incremental adversarial review against that prior report and current
   spec.
3. Score `cases.json` checks with evidence quoted from the produced report.
   Surface-only compliance (e.g. the word "residual" without a failing P0/P1
   when the fixture requires FAIL) is a failed check.

These fixtures compress failure modes observed in real recovery-spec sessions
(wording-only gate "fixes", residual P1 dropped for PASS, hollow finding
fields).

Latest graded run: `cold-eval-results.json` (reports under `runs/`).
