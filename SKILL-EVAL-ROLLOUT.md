# Skill Eval Rollout Queue

This is the execution queue for evaluating repository skills. It does not ship
skills or modify global copies.

## Operating rules

- Evaluate one skill on its real primary harness, not on every adapter.
- Confirm the harness before starting a queued skill. Use a second harness only
  when the skill is genuinely used there or a portability claim requires it.
- Run prompt-context control and treatment arms sequentially.
- Exclude `evals/` from runtime projection. Any access to a source, shipped,
  baseline, installed namesake, hidden grader, or paired workspace invalidates
  the run.
- Keep the current shipped skill when a proposal regresses or adds no measured
  value. Do not move to the next skill while the current skill has an open
  critical assertion.

## Completed pilots

| Skill | Harness / permission | Baseline | Result | Decision |
|---|---|---|---|---|
| `skill-eval` | deterministic adapter and verifier fixtures | bootstrap fixtures | PASS | Infrastructure retained. |
| `risk-calibrated-pr-review` | Codex / read-only | shipped package `3db1fb01...` | FAIL: proposal regression | Keep shipped skill. The proposal overclaimed an authorization defect where authority supported only `INCOMPLETE`. |
| `senior-implementer` | Cursor Auto / workspace-write | without-skill control | PASS | Skill adds measured value: durable-state regression protection and correct release blocking for unrelated money risk. |

The `senior-implementer` smoke against its unchanged old runtime instructions
was intentionally `NO_LIFT`; both artifacts passed. The terminal PASS comes
from the three clean without-skill comparisons, not from that smoke.

## Queue

Harness is deliberately `TBD` until its real usage surface is named. The
permission column is the maximum expected permission for the fixture, not
authority to touch production, GitHub, or global installations.

| # | Skill | Expected permission | Harness | Required distinguishing evidence |
|---:|---|---|---|---|
| 1 | `skill-brief` | read-only | TBD | Intake captures real evaluation examples without inventing assertions. |
| 2 | `skill-design-loop` | workspace-write in proposal only | TBD | Draft lifecycle and runtime activation are distinguished from static self-test success. |
| 3 | `skill-review` | read-only | TBD | Surface-compliant but empty content cannot receive `purpose_pass`. |
| 4 | `revise-skill-from-review` | workspace-write in proposal only | TBD | Closed findings are fixed without unrelated redesign or residual closure claims. |
| 5 | `skill-composition` | read-only | TBD | Invalid invoke/forbid/require edges fail deterministically. |
| 6 | `skill-draft-ship` | proposal write; ship mocked | TBD | Same-hash purpose, eval, composition, and human ship gates are enforced. |
| 7 | `review-implementation` | read-only | TBD | Generic and Laravel-specific reviews load only evidence-supported framework rules. |
| 8 | `tune-skill` | workspace-write in proposal only | TBD | Tactical tune stays bounded; redesign routes to `skill-design-loop`. |
| 9 | `triage-issue` | read-only; issue creation mocked | TBD | Diagnosis stays read-only unless issue creation is explicitly requested. |
| 10 | `spec-readiness` | read-only | TBD | False READY is the critical failure assertion. |
| 11 | `adversarial-diff-review` | read-only | TBD | False PASS and missed high-impact diff consequences fail. |
| 12 | `adversarial-spec-review` | read-only | TBD | Missing reachable contracts cannot pass because the report format looks complete. |
| 13 | `pr-branch` | disposable Git repo; GitHub mocked | TBD | PR body is correct and no real publication occurs. |
| 14 | `commit-work` | disposable Git repo / workspace-write | TBD | Only intended changes enter coherent commits; push remains explicit. |
| 15 | `tdd` | workspace-write | TBD | Ready briefs proceed without redundant approval; unclear contracts stop. |
| 16 | `prompt-creator` | read-only or artifact-write fixture | TBD | Model/version claims are source-bound or compatibility-bounded. |
| 17 | `session-handoff` | artifact-write fixture | TBD | Resume packet preserves exact unresolved state without declaring completion. |
| 18 | `revise-spec-from-review` | workspace-write in fixture | TBD | Exact findings close without contradiction or invented product decisions. |
| 19 | `to-spec` | artifact-write fixture | TBD | Reachable contracts and consequence depth improve over no-skill baseline. |
| 20 | `methodology-selector` | read-only | TBD | Positive fit, veto, precedence, and `none` remain discriminating. |
| 21 | `goal-engineering` | artifact-write fixture | TBD | Exact contract and character ceiling are mechanically verifiable. |
| 22 | `loop-readiness-score` | read-only | TBD | Hard gates override a superficially passing numeric score. |
| 23 | `loop-run-record` | artifact-write fixture | TBD | Record identity binds to the exact goal and readiness evidence. |
| 24 | `methodology-skill-creator` | proposal-write fixture | TBD | Output follows the selected methodology and complete check set. |
| 25 | `loop-orchestrator` | artifact-write fixture | TBD | It preserves handoffs without executing or self-approving. |
| 26 | `skill-path-selector` | read-only | TBD | Route selection beats the no-skill baseline on ambiguous near-miss cases. |
| 27 | `skill-router` | read-only | TBD | Exactly one catalog route, none, or blocked is returned without overlap. |
| 28 | `task-groundwork` | artifact-write fixture | TBD | Grounding adds evidence-backed decisions rather than methodology prose. |
| 29 | `grill-me` | conversational fixture | TBD | Questions expose decision-changing gaps without unnecessary interrogation. |

`skills/lifecycle-build/` is support material and has no root `SKILL.md`, so it
is tested through lifecycle integration rather than queued as an invokable
skill.

## Per-skill loop

```text
confirm real harness
→ snapshot exact baseline
→ calibrate realistic fixtures
→ run sequential isolated control/treatment
→ deterministic artifact checks
→ blind artifact grade
→ hash-bound verdict
→ keep, revise, simplify, or preserve shipped version
```
