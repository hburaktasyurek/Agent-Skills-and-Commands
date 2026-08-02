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
| `skill-eval` | Deterministic fixtures | Bootstrap fixtures | PASS | Infrastructure retained; native no-skill controls now remove explicit invocation and forbid external skill lookup, with deterministic self-test coverage. |
| `risk-calibrated-pr-review` proposal | Codex read-only | Shipped `3db1fb01...` | FAIL | Proposal rejected; shipped remains last-known-better, not certified sufficient. |
| `risk-calibrated-pr-review` shipped runtime | Prior Codex artifact run + current byte identity | Exact shipped baseline | INCONCLUSIVE | Four behavior cases passed on the byte-identical runtime; current package now carries the validated definitions, but implicit trigger trace is still NOT_RUN. |
| `senior-implementer` | Cursor Auto | Without skill | PASS | Shipped package now exactly matches tested hash `404cd5af...`; retained for durable-state proof and release blocking. |
| `review-implementation` | Codex `gpt-5.6-sol`, read-only | Old skill `fb7c7701...` | PASS | Explicit-only package `a4f9f4db...` passed 12/12 assertions with no regression; generic behavior tied, Laravel scope discipline and missing-basis handling improved. |
| `spec-readiness` | Codex `gpt-5.6-sol`, read-only | Old skill `e6193a47...` | PASS | Explicit-only package `ea56beb7...` passed 12/12 assertions; kept READY scope discipline, improved root-family closure, and reduced aggregate run cost. |
| `adversarial-diff-review` | Codex `gpt-5.6-sol`, read-only | Old skill `40bdff18...` | PASS | Explicit-only package `ff697d3e...` passed 12/12 assertions; critical defect behavior held, concurrency and clean-diff artifacts improved, and unsupported merge-readiness framing was removed. |
| `adversarial-spec-review` proposal | Codex `gpt-5.6-sol`, read-only | Old skill `decf8443...` | NO_LIFT | Proposal `75df0df3...` passed 12/12 assertions with no regression, but blind grades tied and aggregate tokens increased; proposal discarded and the shipped package remains unchanged. |
| `revise-spec-from-review` | Codex `gpt-5.6-sol`, disposable workspace | Old skill `b956803c...` | PASS | Explicit-only package `b6e60c6a...` passed 12/12 assertions; retained both root-closure cases and improved the unmade-decision case from 2/5 to 5/5 by leaving choice-dependent spec surfaces unchanged. |
| `to-spec` | Codex `gpt-5.6-sol`, disposable workspace | Without skill | PASS | Explicit-only package `7c4041ba...` passed 14/14 assertions; improved critical closure from 4/5 to 5/5 and kept focused specs to one implementation task without changing supplied code. |

## Queue

| # | Skill | Primary evidence |
|---:|---|---|
| 1 | `task-groundwork` | Grounding adds decision-changing evidence, not generic method prose. |
| 2 | `tdd` | Ready tasks proceed without redundant approval; unclear contracts stop. |
| 3 | `session-handoff` | Resume state is exact, compact, and does not claim false completion. |
| 4 | `commit-work` | Only intended changes enter commits; push remains explicit. |
| 5 | `pr-branch` | PR output fits both audiences and publication remains safe. |
| 6 | `grill-me` | Questions expose decision-changing gaps without needless interrogation. |

## Per-skill loop

```text
snapshot exact baseline
→ define realistic cases
→ calibrate discriminating assertions
→ revise with skill-creator
→ verify in clean paired runs
→ keep, revise again, or discard
```
