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
| `risk-calibrated-pr-review` shipped runtime | Prior Codex artifact run + current byte identity | Exact shipped baseline | INCONCLUSIVE | Four behavior cases passed on the byte-identical runtime; current package now carries the validated definitions, but implicit trigger trace is still NOT_RUN. |
| `senior-implementer` | Cursor Auto | Old skill `b11383bb...` | PASS | Package `7364c55b...` passed 11/11 assertions with no regression; blind grades improved root closure 4→5, durable-state proof 4→5, and money-risk release blocking 3→5. |
| `review-implementation` | Codex `gpt-5.6-sol`, read-only | Old skill `fb7c7701...` | PASS | Explicit-only package `a4f9f4db...` passed 12/12 assertions with no regression; generic behavior tied, Laravel scope discipline and missing-basis handling improved. |
| `spec-readiness` | Codex `gpt-5.6-sol`, read-only | Old skill `e6193a47...` | PASS | Explicit-only package `ea56beb7...` passed 12/12 assertions; kept READY scope discipline, improved root-family closure, and reduced aggregate run cost. |
| `adversarial-diff-review` | Codex `gpt-5.6-sol`, read-only | Old skill `40bdff18...` | PASS | Explicit-only package `ff697d3e...` passed 12/12 assertions; critical defect behavior held, concurrency and clean-diff artifacts improved, and unsupported merge-readiness framing was removed. |
| `adversarial-spec-review` proposal | Codex `gpt-5.6-sol`, read-only | Old skill `decf8443...` | NO_LIFT | Proposal `75df0df3...` passed 12/12 assertions with no regression, but blind grades tied and aggregate tokens increased; proposal discarded and the shipped package remains unchanged. |
| `revise-spec-from-review` | Codex `gpt-5.6-sol`, disposable workspace | Old skill `b956803c...` | PASS | Explicit-only package `b6e60c6a...` passed 12/12 assertions; retained both root-closure cases and improved the unmade-decision case from 2/5 to 5/5 by leaving choice-dependent spec surfaces unchanged. |
| `to-spec` | Codex `gpt-5.6-sol`, disposable workspace | Without skill | PASS | Explicit-only package `7c4041ba...` passed 14/14 assertions; improved critical closure from 4/5 to 5/5 and kept focused specs to one implementation task without changing supplied code. |
| `task-groundwork` | Cursor Auto, read-only | Old skill `716c196c...` | PASS | Explicit-only package `b2cdb1e5...` passed 11/11 assertions with no regression; blind grades improved roadmap closure, direct-request scope, and narrow-task negative fit from 4/5 to 5/5. |
| `tdd` | Cursor Auto, disposable workspace | Old skill `678f1789...` | PASS | Explicit-only package `8ba01d4e...` passed 11/11 assertions with no regression; blind grading improved contract-correct non-string handling from 3/5 to 5/5 and tied the contract-stop and durable-state cases at 5/5. |
| `session-handoff` | Cursor Auto, disposable workspace | Old skill `ffbf2f90...` | PASS | Explicit-only package `892621e6...` passed 11/11 assertions with no regression; blind grades improved exact code resumption 3→5, compact design continuation 4→5, and no-context scope preservation 1→5. |
| `commit-work` proposal | Codex `gpt-5.6-sol`, disposable Git repositories | Old skill `35384001...` | NO_LIFT | Proposal `3a5057df...` passed 13/13 assertions with no regression, but blind grades tied 5/5 in all three cases while aggregate duration and token use increased; proposal discarded and shipped package `35384001...` remains unchanged. Cursor is not certified for the no-attribution contract because its host injected a prohibited trailer. |
| `pr-branch` | Cursor Auto, disposable Git repositories and mocked GitHub | Old skill `4af239b3...` | PASS | Explicit-only package `20ee9333...` passed 12/12 assertions with no regression; blind grades improved grounded description-only output 2→5, safe and verified PR publication 2→5, and ambiguous-base scope preservation 4→5. |

## Queue

| # | Skill | Primary evidence |
|---:|---|---|
| 1 | `grill-me` | Questions expose decision-changing gaps without needless interrogation. |

## Per-skill loop

```text
snapshot exact baseline
→ define realistic cases
→ calibrate discriminating assertions
→ revise with skill-creator
→ verify in clean paired runs
→ keep, revise again, or discard
```
