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
| `senior-implementer` eval-only proposal | Cursor Auto | Without skill | PASS | Runtime behavior retained; the shipped package's older eval definition still needs schema normalization before another verify run. |

## Queue

| # | Skill | Primary evidence |
|---:|---|---|
| 1 | `senior-implementer` eval schema | Normalize the retained package's behavior cases without changing runtime instructions. |
| 2 | `review-implementation` | Generic review must not load framework or project-memory rules without evidence. |
| 3 | `spec-readiness` | A structurally incomplete spec cannot receive READY. |
| 4 | `adversarial-diff-review` | Missed high-impact consequences and false survival verdicts fail. |
| 5 | `adversarial-spec-review` | Missing reachable contracts cannot pass because the report looks complete. |
| 6 | `revise-spec-from-review` | Complete findings close without contradiction or invented decisions. |
| 7 | `to-spec` | Reachable contracts improve over the without-skill baseline. |
| 8 | `task-groundwork` | Grounding adds decision-changing evidence, not generic method prose. |
| 9 | `tdd` | Ready tasks proceed without redundant approval; unclear contracts stop. |
| 10 | `session-handoff` | Resume state is exact, compact, and does not claim false completion. |
| 11 | `commit-work` | Only intended changes enter commits; push remains explicit. |
| 12 | `pr-branch` | PR output fits both audiences and publication remains safe. |
| 13 | `grill-me` | Questions expose decision-changing gaps without needless interrogation. |

## Per-skill loop

```text
snapshot exact baseline
→ define realistic cases
→ calibrate discriminating assertions
→ revise with skill-creator
→ verify in clean paired runs
→ keep, revise again, or discard
```
