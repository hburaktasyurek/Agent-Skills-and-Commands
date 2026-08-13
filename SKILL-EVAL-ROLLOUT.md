# Skill Eval Rollout Queue

Evaluate only retained skills, one real primary harness at a time. This queue
does not modify global copies.

## Rules

- Use an exact Git revision for an existing-skill baseline and
  `without_skill` for a new package.
- Keep prompt, files, model, harness, permissions, and limits equal.
- Grade produced artifacts; headings and procedure claims are not evidence.
- Keep a revision only on current-package PASS.
- Do not move on while a critical assertion remains open.

## Completed pilots

| Skill | Harness | Baseline | Result | Decision |
|---|---|---|---|---|
| `skill-eval` | Deterministic fixtures | Bootstrap fixtures | PASS | Infrastructure retained; provenance records cannot leak into executor inputs, Cursor on macOS denies exact source, baseline, and namesake package reads at the OS boundary, and unsupported namesake isolation stops before execution. |
| `risk-calibrated-pr-review` proposal | Codex read-only | Shipped `3db1fb01...` | FAIL | Proposal rejected; shipped remains last-known-better, not certified sufficient. |
| `risk-calibrated-pr-review` shipped runtime | Codex read-only | Exact shipped baseline | INCONCLUSIVE | Current package `b24f3e45...` has a valid, provenance-separated eval definition, but no exact-package paired run can prove lift over its byte-identical shipped baseline and the implicit trigger trace is still NOT_RUN. Preserve this limitation; do not claim certification. |
| `senior-implementer` | Cursor Auto | Old skill `b11383bb...` | PASS | Package `7364c55b...` passed 11/11 assertions with no regression; blind grades improved root closure 4→5, durable-state proof 4→5, and money-risk release blocking 3→5. |
| `review-implementation` | Codex `gpt-5.6-sol`, read-only | Old skill `fb7c7701...` | PASS | Provenance-separated package `5ecb367d...` passed 12/12 assertions with no regression; generic and Laravel cases tied at 5/5, and missing-basis handling improved 4→5. |
| `spec-readiness` | Codex `gpt-5.6-sol`, read-only | Old skill `e6193a47...` | PASS | Provenance-separated package `2191595a...` passed 12/12 assertions with no regression after keeping shared identity and uniqueness conflict in one decision family and forbidding invented activation timing; grades were 5→5, 3→5, and 5→5. |
| `adversarial-diff-review` | Codex `gpt-5.6-sol`, read-only | Old skill `40bdff18...` | PASS | Provenance-separated package `4d6d17ed...` passed 12/12 assertions with no regression; critical cases tied at 5/5 and clean-diff scope discipline improved 1→5. |
| `adversarial-spec-review` proposal | Codex `gpt-5.6-sol`, read-only | Old skill `decf8443...` | NO_LIFT | Proposal `75df0df3...` passed 12/12 assertions with no regression, but blind grades tied and aggregate tokens increased; proposal discarded and the shipped package remains unchanged. |
| `to-spec` | Codex `gpt-5.6-sol`, disposable workspace | Without skill | PASS | Provenance-separated package `5f2de204...` passed 14/14 assertions with no regression; both complex cases tied at 5/5 and the focused one-task spec improved 4→5 without changing supplied code. |
| `task-groundwork` | Cursor Auto, read-only | Old skill `716c196c...` | PASS | Explicit-only package `b2cdb1e5...` passed 11/11 assertions with no regression; blind grades improved roadmap closure, direct-request scope, and narrow-task negative fit from 4/5 to 5/5. |
| `tdd` | Cursor Auto, disposable workspace | Old skill `678f1789...` | PASS | Explicit-only package `8ba01d4e...` passed 11/11 assertions with no regression; blind grading improved contract-correct non-string handling from 3/5 to 5/5 and tied the contract-stop and durable-state cases at 5/5. |
| `session-handoff` | Cursor Auto, disposable workspace | Old skill `ffbf2f90...` | PASS | Explicit-only package `892621e6...` passed 11/11 assertions with no regression; blind grades improved exact code resumption 3→5, compact design continuation 4→5, and no-context scope preservation 1→5. |
| `commit-work` proposal | Codex `gpt-5.6-sol`, disposable Git repositories | Old skill `35384001...` | NO_LIFT | Proposal `3a5057df...` passed 13/13 assertions with no regression, but blind grades tied 5/5 in all three cases while aggregate duration and token use increased; proposal discarded and shipped package `35384001...` remains unchanged. Cursor is not certified for the no-attribution contract because its host injected a prohibited trailer. |
| `pr-branch` | Cursor Auto, disposable Git repositories and mocked GitHub | Old skill `4af239b3...` | PASS | Explicit-only package `20ee9333...` passed 12/12 assertions with no regression; blind grades improved grounded description-only output 2→5, safe and verified PR publication 2→5, and ambiguous-base scope preservation 4→5. |
| `pr-branch` business-visibility revision | Cursor Auto, disposable Git repositories and mocked GitHub | Prior package `20ee9333...` | PASS | Package `6bb97f65...` passed 16/16 assertions with no regression; blind grades improved small-PR plain language 3→5, mocked publication 4→5, retained ambiguous-base safety at 5→5, and improved broad invisible-work visibility 2→5. |
| `grill-me` | Cursor Auto, disposable workspaces | Old skill `e4eee69e...` | PASS | Explicit-only package `c0168955...` passed 12/12 assertions with no regression; blind grades tied evidence-grounded rollout and complete-plan stopping at 5/5, while the no-data business-decision case improved 2→5 by refusing to invent an objective or recommendation. |

## Queue

No retained runtime rewrite remains in the current rollout queue.
`risk-calibrated-pr-review` remains an explicitly preserved `INCONCLUSIVE`
until a real Codex implicit-trigger trace and a meaningful comparison baseline
exist; synthetic PASS must not replace that evidence.

## Per-skill loop

```text
snapshot exact baseline
→ define realistic cases
→ calibrate discriminating assertions
→ revise with skill-creator
→ verify in clean paired runs
→ keep, revise again, or discard
```
