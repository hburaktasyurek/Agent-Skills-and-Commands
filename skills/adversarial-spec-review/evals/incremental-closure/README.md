# Incremental-closure evals

Grade the **report artifact** from an incremental `adversarial-spec-review`
run on each fixture. Do not grade claimed reading order or checklist prose.

Cycle field is `first | rewrite-1 | stop`. There is no `1/3`–`3/3` ladder.
Calling a landed substrate is PASS; swallowing a sibling outcome is FAIL.
`Next` is `to-spec`, `spec-readiness`, or omitted on stop.

## How to run

1. Clean session. Provide the fixture `input/` (task, prior-report when
   present, `spec/`).
2. Invoke `full` review for a fixture without a prior report; otherwise invoke
   incremental review against the exact prior report and current spec.
3. Score `cases.json` checks with evidence quoted from the produced report.
   Surface-only compliance (for example, saying "residual" without the
   required P0/P1) is a failed check. Findings must use the compact
   Evidence and impact / Root and closure / Proof contract; do not require a
   coverage receipt or a separate Consequence surface.
4. For re-review fixtures, verify the report carries `first | rewrite-1 |
   stop`, classifies every current root as incomplete closure, prior-review
   gap, or revision-induced, and gives repeat diagnosis for a repeated Root
   cluster. In `residual-p1-forbids-pass` and `revision-induced-new-root`,
   keep same-outcome siblings in the current FAIL batch rather than an
   unrelated full re-sweep; a detected prior-review gap must return both
   confirm and capture deadline manifestations under one Root and closure
   family. Those rewrite FAILs are the second FAIL (`stop`).
5. For `third-cycle-stop`, verify a one-line `Basis` containing `stop`, a
   compact `Workflow stop` terminal report that replaces `Next`, and two or
   three plain-language choices with consequences. Treat `Consequence
   posture`, `Task contract`, `Coverage receipt`, `Checked and solid`, or
   `Next` as a failed check. Do not grade a word or token budget; do not
   relax correctness evidence.
6. For `fenced-neighbor`, score invoke vs swallow: naming or calling landed
   `Provider::update` is not lock enlargement; owning `CheckoutRenderer` /
   `Provider::create` as this child's outcome is FAIL.

These fixtures compress real recovery-spec failure modes: wording-only gate
"fixes", residual P1 dropped for PASS, hollow compact finding fields, a
detectable root missed by a prior review, a revision-created root, second
FAIL stop instead of another rewrite, and sibling-outcome swallow vs
substrate-call.

`cold-eval-results.json` and `runs/2026-08-02/` are historical artifacts from
the pre-convergence contract; they do not grade the cycle/classification rules.
