# Skills Index

Grouped view of the skills in this repo. The directory layout stays flat — this file is the curated reading order.

## Planning & Design

Stress-test ideas before writing code.

- [task-groundwork](task-groundwork/SKILL.md) — Apply 5W2H to ground a non-trivial software task into an evidence-backed decision context before specification or implementation.
- [grill-me](grill-me/SKILL.md) — (optional) Stress-test a plan, decision, or idea through a one-question-at-a-time interview.
- [to-spec](to-spec/SKILL.md) — Produce a consequence-calibrated four-file implementation spec with complete reachable contracts and proportional depth.
- [adversarial-spec-review](adversarial-spec-review/SKILL.md) — Red-team review that tries to kill a plan; P0–P3 findings with verdict.
- [spec-readiness](spec-readiness/SKILL.md) — Final gate: can an implementer start every task tomorrow?
- [revise-spec-from-review](revise-spec-from-review/SKILL.md) — Reconcile supplied spec-review findings without introducing contradictions or silently choosing missing product behavior.

## Implementation

Day-to-day coding workflow.

- [senior-implementer](senior-implementer/SKILL.md) — Implement a spec or brief end-to-end, and apply complete review findings as bounded fixes. Trust the spec, stop when it breaks, ship complete.
- [tdd](tdd/SKILL.md) — Red-green-refactor TDD loop, with reference docs on tests, mocking, refactoring, deep modules, interface design.

## Loop Engineering

Design small, verifiable agent loops and methodology-specific instructions.
Use the focused skills directly, or use the thin orchestrator when the handoff
order itself needs coordination.

- [methodology-selector](methodology-selector/SKILL.md) — Select one of twelve canonical methodologies, or none, using positive fit, negative-fit veto, and stage precedence.
- [goal-engineering](goal-engineering/SKILL.md) — Render the canonical eight-field contract plus controls into a goal; report the exact count and enforce a universal 4,000-character ceiling.
- [loop-readiness-score](loop-readiness-score/SKILL.md) — Score eleven weighted criteria out of 100, rerender, independently recount, and gate a goal without repairing or executing it.
- [loop-run-record](loop-run-record/SKILL.md) — Normalize externally supplied evidence after one ready run, bind it to the exact goal/readiness identity, and return it for human review.
- [methodology-skill-creator](methodology-skill-creator/SKILL.md) — Create one task-scoped methodology SKILL.md from a completed selector contract; focused skill content may exceed the loop goal's 4,000-character ceiling.
- [loop-orchestrator](loop-orchestrator/SKILL.md) — Preserve and route the shared contract between focused design and evidence skills; never execute or self-approve.

## Triage & Refactor Planning

When the work is "figure out what to do," not "do it."

- [triage-issue](triage-issue/SKILL.md) — Investigate a bug, find root cause, file a GitHub issue with a TDD-based fix plan.

## Shipping

Wrapping work up.

- [commit-work](commit-work/SKILL.md) — Stage intended changes, split coherent Conventional Commits, and verify; push only when explicitly asked.
- [risk-calibrated-pr-review](risk-calibrated-pr-review/SKILL.md) — Review a current PR with zero assumed correctness: establish complete task and consequence scope, scale attack depth to evidenced impact, and bind PASS, FAIL, or INCOMPLETE to an exact PR revision.
- [adversarial-diff-review](adversarial-diff-review/SKILL.md) — Hostile kill-test for an explicitly requested branch/worktree/PR diff, especially before a PR exists; the canonical opened-PR merge gate is risk-calibrated-pr-review.
- [review-implementation](review-implementation/SKILL.md) — Before-PR named-spec compliance: checklist + known-pitfall sweep (tenancy, auth, migrations, payments); Ready-for-PR verdict (not the hostile merge gate).
- [pr-branch](pr-branch/SKILL.md) — Write a two-block PR description (non-technical summary + technical detail), open the PR.
- [session-handoff](session-handoff/SKILL.md) — Optional controlled resume packet for a fresh window when mid-work context must survive; not a mandatory end-of-goal step.

## Meta — Skills About Skills

Building and tuning the system itself.

- [skill-brief](skill-brief/SKILL.md) — 5W2H: fill the skill-path-selector checklist; use bounded grill-me only for missing fields.
- [skill-router](skill-router/SKILL.md) — Decision Matrix: recommend exactly one catalog skill for a job, or none/blocked.
- [skill-composition](skill-composition/SKILL.md) — Procedural: check one skill's invoke/forbid/require edges against the catalog.
- [skill-path-selector](skill-path-selector/SKILL.md) — Decision Matrix: choose methodology / decompose / procedural / blocked from the skill checklist (via skill-brief when incomplete).
- [skill-design-loop](skill-design-loop/SKILL.md) — Explicit procedural orchestrator: repository preflight, bounded intake, path selection, and one proposal draft; stop before review or ship.
- [skill-draft-ship](skill-draft-ship/SKILL.md) — Explicit procedural harness: draft from a complete selected path or ship after purpose and composition gates.
- [skill-review](skill-review/SKILL.md) — SMART Goals: purpose_pass / purpose_fail on a draft path only.
- [revise-skill-from-review](revise-skill-from-review/SKILL.md) — PDCA: closed-list draft edits after purpose_fail.
- [prompt-creator](prompt-creator/SKILL.md) — Interview-driven Claude prompt builder grounded in Anthropic's best practices.
- [tune-skill](tune-skill/SKILL.md) — Tactical, complaint-driven edit to an existing shipped skill: diagnose root cause, smallest change, cold-read review.
