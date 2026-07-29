# Modular Loop System Validation Log

Historical snapshot: this log certifies the five-component system committed as
`7fdd8e7`. The later execution-learning layer and sixth component are validated
separately in
[loop-run-record/references/validation-log.md](../../loop-run-record/references/validation-log.md).

## Authoritative scope

Status: **complete candidate — fourth independent adversarial review PASS with
no P0-P3 findings**. Never treat a partial methodology slice as completion.

The system consists of five small, interoperable components:

1. methodology-selector
2. methodology-skill-creator (renders methodology SKILL.md only; outer
   draft/ship harness is `skill-creator`)
3. one universal goal-engineering renderer
4. loop-readiness-score
5. a thin loop-orchestrator

The shared contract contains Methodology, Task, Audience, Context, Output
Format, Validation, Method Fit, and Human Review / Stop.

The canonical catalog must support exactly twelve methods: Pyramid Principle,
5 Whys, 5W2H, SMART Goals, PDCA, SWOT, STAR, AIDA, Feynman Technique, OKR,
Work Breakdown Structure, and Decision Matrix. The supplied Loop Engineering
methodology generator is authoritative only for each method's name,
definition, best/avoid fit, principles, steps, stop rule, and quality
questions. Unrelated site parity is out of scope.

One universal renderer serves every agent tool. The 4,000-character hard limit
applies to generated loop goals, not to SKILL.md files. Skills must remain
focused and may move detail into references, but can exceed 4,000 characters
when their bounded contract requires it. Skill character counts are
informational and never reuse the loop-goal hard gate.

Readiness must implement eleven weighted criteria totaling 100 plus
blocked/supervised/ready verdicts. Hard safety gates override the numeric
score.

## Baseline

- Starting HEAD: `b321e82394172d1b0e473245a2076ba8ab41ffd2`
- Allowed change scope: README.md, skills/INDEX.md, and the five new loop-system
  directories only.
- Pre-existing skill directories that must remain unchanged:
  adversarial-diff-review, adversarial-spec-review, commit-work, pr-branch,
  prompt-creator, prompt-creator-workspace, review-implementation,
  revise-spec-from-review, senior-implementer, session-handoff,
  spec-readiness, task-groundwork, tdd, to-spec, triage-issue, tune-skill.
- Commit, push, publish, install, global-copy edits, and repository-external
  writes are prohibited for this goal.

## Verification contract

- Per method: at least one positive-fit and one negative-fit cold routing run.
  Check exact slug, negative veto, deferred method, and must-not selections.
  Fixtures alone are not evidence; a separate reviewer reruns blinded cases.
- Render a task-scoped methodology skill and a universal goal for all twelve
  methods.
- Goal tests include exact 4,000 pass, 4,001 full-content failure, invalid
  limits, and absence of target-specific branches.
- Readiness tests include No/Partial/Yes scoring, eleven weights totaling 100,
  score bands, recommended correction, and every hard-gate override.
- Full integration covers both selector-to-goal-to-readiness and
  selector-to-methodology-skill for all twelve methods.
- Final read-only review must compare source content, routing, boundaries,
  tests, and the complete diff with the authoritative goal. Completion
  requires PASS with no unresolved P0-P3 findings.

## Evidence

- Authoritative goal length: 3,562/4,000 characters.
- Independent pre-implementation goal review: PASS with no P0-P3 findings.
- Canonical source matrix: 12 manifest entries, 12 unique slugs, and 12
  existing canonical references. Selector, creator, and goal renderer consume
  this manifest; method content remains in the references. Slugs:
  `pyramid-principle`, `five-whys`, `five-w-two-h`, `smart-goals`, `pdca`,
  `swot`, `star`, `aida`, `feynman`, `okr`,
  `work-breakdown-structure`, and `decision-matrix`.
- `node skills/methodology-selector/scripts/self-test.mjs`: 160 assertions pass
  across 26 cases. The check covers all 12 positive/negative-fit pairs, two
  deferred overlaps, all canonical sections and safety stops, and the
  persisted independent observed-results matrix.
- Independent blinded selector review: 26/26 primary decisions, 2/2 asserted
  deferred decisions, and zero must-not violations. The reviewer found one P3
  ambiguity between open discovery and 5W2H; a bounded catalog precedence rule
  fixed it. Cold recheck passed the affected four cases with no P0-P3 findings.
  The independent reviewer then certified
  `evals/cold-routing-results.json` against the timestamped decisions: exact
  26/26 evidence, 12/12 positive downstream seeds, and no P0-P3 findings.
- `node skills/goal-engineering/scripts/self-test.mjs`: 38 assertions pass,
  including all 12 slugs, identical content for Claude Code/Codex/Cursor/other,
  exact 4,000 pass, full 4,001 failure without truncation, stricter explicit
  limits, invalid limits, `none`, and approval consistency. Sample goal:
  2,550/4,000.
- `node skills/methodology-skill-creator/scripts/self-test.mjs`: 32 assertions
  pass, including one task-scoped render for each of 12 methods and a focused
  4,620-character skill accepted without truncation. Skill character counts
  are informational.
- `node skills/loop-readiness-score/scripts/self-test.mjs`: 49 assertions pass.
  The 11 weights total 100; No/Partial/Yes yield 0/50/100; all score bands,
  the exact 39/40/59/60/79/80 boundaries, recommended correction, and all 14
  hard-gate overrides are exercised. Fractional odd-weight cases prove
  `3.5→4` and `79.5→80 / Strong / ready` after one final `Math.round`.
  Each hard gate returns `blocked` even when the remaining score would pass.
- `node skills/loop-readiness-score/scripts/integration-test.mjs`: PASS at
  100/100 and `ready`; the generated goal is 2,550/4,000.
- `node skills/loop-orchestrator/scripts/self-test.mjs`: 20 assertions pass for
  exact eight-field handoff and terminal states `none`, `blocked`,
  `supervised`, `ready`, and `review-required`, without status upgrades. Missing
  goals, changed goal contracts, forged scores or gate verdicts, incomplete
  creator checks, detached readiness evidence, and methodology-mismatched goal
  or creator artifacts are rejected. Blocked and supervised handoffs retain
  score, band, failed gates, and the recommended correction.
- `node skills/loop-orchestrator/scripts/full-integration-test.mjs`: 12/12
  methods pass both selector-to-goal-to-readiness and
  selector-to-methodology-skill paths by consuming the certified positive cold
  result for each method, its unchanged routing input, and its canonical
  reference. Readiness results are 93-100/100 `ready`, every generated skill
  returns `review-required`, and the largest goal is 1,862/4,000.
- Syntax, JSON, and frontmatter check: every new `.mjs` parses; all six JSON
  fixtures/manifests parse; all five SKILL.md files have names matching their
  directories. SKILL.md sizes range from 2,643 to 4,726 characters; no skill
  size is evaluated against the loop-goal ceiling.
- Final baseline check before review: HEAD remains
  `b321e82394172d1b0e473245a2076ba8ab41ffd2`; all 15 tracked pre-existing
  skill directories are unchanged; the only changed paths are README,
  skills/INDEX, and the five new loop-system directories.
- First final adversarial review: FAIL with 2 P1, 2 P2, and 1 P3. It found a
  manifest-constructed integration path, weak terminal artifact validation,
  incomplete canonical safety stops, missing persisted per-case cold evidence,
  and one stale "three components" fixture sentence.
- Bounded correction: integration now consumes the independently certified
  matrix; terminal handoffs validate complete goal/readiness/creator evidence;
  every canonical stop preserves the live generator's method-fit,
  missing-context, and no-guessing human return; the 26-case matrix is
  persisted and rerunnable; the fixture says five focused components.
- Second adversarial review: FAIL with 3 P1. It found outdated three-band
  readiness thresholds, readiness evidence detached from the returned goal,
  and blocked/supervised handoffs that omitted corrective evidence.
- Second bounded correction: readiness uses the live four bands at
  0/40/60/80 with six exact boundary tests; terminal handoff reruns readiness
  against the exact goal and complete readiness envelope; every goal handoff
  returns both artifacts, score/band, failed gates, and the single recommended
  correction.
- Third adversarial review: FAIL with 1 P1. It confirmed all three prior P1s
  resolved, then found that fractional totals were not rounded like the live
  source and could change the 80-point band and verdict.
- Third bounded correction: per-criterion fractional earnings remain visible,
  but the total is rounded once before band and verdict logic; handoff score
  integrity uses the same rounding rule; 3.5 and 79.5 regressions pass.
- Fourth independent adversarial review: PASS with no P0, P1, P2, or P3
  findings. Coverage was complete across the current goal, live methodology
  and readiness sources, full worktree, all tests and unhappy paths, source
  duplication, scope, and baseline. The reviewer independently reproduced the
  79.5→80 case and confirmed bound terminal evidence. Nothing was deferred;
  no files were edited by the reviewer and no commit was made.

## Rejected shortcuts

- Absorbing `skill-creator` draft/ship/purpose gates into methodology-skill-creator or loop-orchestrator.
- Treating a passing slice, infrastructure, fixtures, or partial matrix as
  completion.
- One monolithic skill or duplicated canonical methodology data.
- Separate Claude Code, Codex, Cursor, or other target renderers.
- Cloning unrelated Loop Engineering tools, presets, or five-output parity.
- Applying the 4,000-character goal limit to SKILL.md files.
- Truncating or rejecting an otherwise focused skill merely for exceeding
  4,000 characters.
- Silent truncation, dropped requirements, self-review, or self-approval.
- Letting human approval widen the prohibited scope of this goal.

## Revision budget and fallback

Maximum six revision cycles; stop after two identical failures without new
evidence. If blocked, preserve the uncommitted diff and evidence, name the
smallest failed criterion, and propose one bounded correction without marking
the goal complete.

## Discovery boundary (methodology-skill-creator)

Frontmatter `description` is cold discovery only: `skill_summary` + `best_when`
(+ optional Triggers suffix max 3). It must not leak `contract.task`,
`audience`, or embedded-method boilerplate. Runtime eight fields stay in the
body; `## Fit` is stripped and When to use is the fit surface. Limit and
newline failures throw before checks; no new CREATOR_CHECKS keys.
