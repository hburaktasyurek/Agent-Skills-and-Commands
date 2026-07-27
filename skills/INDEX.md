# Skills Index

Grouped view of the skills in this repo. The directory layout stays flat — this file is the curated reading order.

## Planning & Design

Stress-test ideas before writing code.

- [task-groundwork](task-groundwork/SKILL.md) — Ground a roadmap task in its phase context by investigating artifacts; resolves the decision tree, escalates only what artifacts can't answer.
- [adversarial-spec-review](adversarial-spec-review/SKILL.md) — Red-team review that tries to kill a plan; P0–P3 findings with verdict.
- [to-spec](to-spec/SKILL.md) — Turn a design conversation into a production-ready spec folder.
- [spec-readiness](spec-readiness/SKILL.md) — Final gate: can an implementer start every task tomorrow?
- [revise-spec-from-review](revise-spec-from-review/SKILL.md) — Reconcile only supplied spec-review findings: verify the finding and remedy separately, edit confirmed in-scope issues, and push back on the rest.

## Implementation

Day-to-day coding workflow.

- [senior-implementer](senior-implementer/SKILL.md) — Implement a spec or brief end-to-end. Trust the spec, stop when it breaks, ship complete.
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

- [commit-work](commit-work/SKILL.md) — Stage and split changes into Conventional Commits. Delegates to Haiku/Sonnet based on diff size.
- [adversarial-diff-review](adversarial-diff-review/SKILL.md) — Red-team review that tries to kill an implementation diff against its task definition; P0–P3 findings with file:line evidence and a coverage declaration.
- [review-implementation](review-implementation/SKILL.md) — Systematic spec-vs-implementation compliance audit: checklist coverage plus known-pitfall sweep (tenancy, auth, migrations, payments); Ready-for-PR verdict.
- [pr-branch](pr-branch/SKILL.md) — Write a two-block PR description (non-technical summary + technical detail), open the PR.
- [session-handoff](session-handoff/SKILL.md) — Structured handoff doc capturing progress, decisions, and open questions.

## Meta — Skills About Skills

Building and tuning the system itself.

- [prompt-creator](prompt-creator/SKILL.md) — Interview-driven Claude prompt builder grounded in Anthropic's best practices.
- [tune-skill](tune-skill/SKILL.md) — Tactical, complaint-driven edit to an existing skill: diagnose root cause, smallest change, cold-read review.
