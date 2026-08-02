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
| `skill-eval` | Deterministic fixtures | Bootstrap fixtures | PASS | Infrastructure retained. |
| `risk-calibrated-pr-review` proposal | Codex read-only | Shipped `3db1fb01...` | FAIL | Proposal rejected; shipped remains last-known-better, not certified sufficient. |
| `risk-calibrated-pr-review` shipped runtime | Prior Codex artifact run + current byte identity | Exact shipped baseline | INCONCLUSIVE | Four behavior cases passed on the byte-identical runtime; current package now carries the validated definitions, but implicit trigger trace is still NOT_RUN. |
| `senior-implementer` | Cursor Auto | Without skill | PASS | Shipped package now exactly matches tested hash `404cd5af...`; retained for durable-state proof and release blocking. |

## Queue

| # | Skill | Primary evidence |
|---:|---|---|
| 1 | `review-implementation` | Generic review must not load framework or project-memory rules without evidence. |
| 2 | `spec-readiness` | A structurally incomplete spec cannot receive READY. |
| 3 | `adversarial-diff-review` | Missed high-impact consequences and false survival verdicts fail. |
| 4 | `adversarial-spec-review` | Missing reachable contracts cannot pass because the report looks complete. |
| 5 | `revise-spec-from-review` | Complete findings close without contradiction or invented decisions. |
| 6 | `to-spec` | Reachable contracts improve over the without-skill baseline. |
| 7 | `task-groundwork` | Grounding adds decision-changing evidence, not generic method prose. |
| 8 | `tdd` | Ready tasks proceed without redundant approval; unclear contracts stop. |
| 9 | `session-handoff` | Resume state is exact, compact, and does not claim false completion. |
| 10 | `commit-work` | Only intended changes enter commits; push remains explicit. |
| 11 | `pr-branch` | PR output fits both audiences and publication remains safe. |
| 12 | `grill-me` | Questions expose decision-changing gaps without needless interrogation. |

## Per-skill loop

```text
snapshot exact baseline
→ define realistic cases
→ calibrate discriminating assertions
→ revise with skill-creator
→ verify in clean paired runs
→ keep, revise again, or discard
```
