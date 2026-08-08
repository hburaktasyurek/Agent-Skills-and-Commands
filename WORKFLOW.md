# Personal Multi-Session Workflow

This document records the stable workflow. Agent surfaces and models may
change without changing responsibility boundaries.

## Core rule

Separate design, review, implementation, and shipping when independent
judgment matters. Carry exact artifacts and verdicts between sessions; do not
replace them with memory summaries.

## Canonical product flow

```text
task-groundwork
→ to-spec
→ adversarial-spec-review
→ spec-readiness
→ senior-implementer
→ review-implementation        # named-spec work only
→ commit-work
→ pr-branch                    # open or refresh when a PR is wanted
→ risk-calibrated-pr-review    # opened PR only
→ human merge decision
```

`grill-me` is optional for unresolved design forks. Use
`adversarial-diff-review` when hostile review is useful before opening a PR;
it does not replace the opened-PR gate.

## Responsibilities

| Role | Owns | Must not absorb |
|---|---|---|
| Design | Grounding, product decisions, specs, verified spec corrections | Implementation, PR creation, merge |
| Review | Spec attack, readiness, spec-code compliance, PR attack | Editing the reviewed artifact or approving its own corrections |
| Implementation | Root-complete delivery of the task or complete findings | Unrelated redesign, PR creation, merge |
| Commit / PR | Intentional commits, PR description, requested publication | Implementation or independent review |
| Human | Scope changes and commit/push/install/merge authority | Treating an automated verdict as irreversible permission |

## Artifact inputs

| Skill | Required input |
|---|---|
| `task-groundwork` | Authoritative task description or direct request |
| `to-spec` | Grounded frame or equivalent current evidence |
| `adversarial-spec-review` | Current spec cluster |
| `spec-readiness` | Current spec cluster |
| `revise-spec-from-review` | Complete failed spec-review or readiness report |
| `senior-implementer` | Approved spec/brief or direct task; complete findings when correcting review failures |
| `review-implementation` | Approved named spec and current implementation |
| `adversarial-diff-review` | Explicit branch/worktree/diff boundary |
| `commit-work` | Current Git worktree |
| `pr-branch` | Current branch and confirmed base |
| `risk-calibrated-pr-review` | Current PR; complete prior report/head for eligible incremental review |
| `skill-eval` | Current skill path, exact baseline, eval definition, one harness and model |

## Spec design

1. Use `task-groundwork` unless the session already states task authority,
   scope/non-goals, and acceptance or stop conditions.
2. Produce the implementation handoff with `to-spec`.
3. Run `adversarial-spec-review` independently.
4. On FAIL, give the complete report to `revise-spec-from-review`, then
   re-review the current spec. Do not drop residual P0/P1 findings for PASS.
5. Run `spec-readiness`. On failure, revise from the complete report and
   rerun readiness.
6. Hand off only after both review gates pass.

Incremental spec re-review requires the complete prior report and matching
artifact basis, unchanged task contract, and changes bounded to the prior
closure surface. Otherwise reset to full review.

## Implementation and PR

1. For a named spec, give the exact spec cluster to `senior-implementer`.
   For a direct task, the current request is sufficient authority.
2. Named-spec work must pass `review-implementation` before PR. Bind that
   receipt to the spec-file hashes, implementation HEAD, and staged/unstaged
   plus relevant-untracked fingerprint. Any basis change invalidates it.
3. Use `commit-work`; use `pr-branch` only when a PR is requested. After every
   push to an open PR, invoke `pr-branch` to regenerate, validate, apply, and
   verify the current title/body before hostile re-review.
4. Run `risk-calibrated-pr-review` against the exact opened PR revision.
5. On FAIL, return complete findings to `senior-implementer`; after fixes,
   rerun named-spec compliance when applicable, commit, refresh the open PR,
   and then rerun PR review.
6. On INCOMPLETE, gather named evidence. Implementation changes trigger the
   same invalidation and rerun rules.
7. PASS returns the merge decision to the human; it never merges.

The correction loop is therefore:

```text
senior-implementer
→ review-implementation        # named-spec work
→ commit-work
→ pr-branch                    # open or refresh
→ risk-calibrated-pr-review
```

Spec review, readiness, implementation review, and PR review results are gate
receipts for exact artifacts, not durable approval of a task name. A changed
spec cluster, implementation basis, or PR head invalidates only the receipts
that depend on it and requires those gates to run again.

Incremental PR re-review requires the exact prior report/head, stable base and
task, provable ancestry and bounded delta, adequate prior coverage, and no new
impact surface or material invariant. Otherwise reset to full review.

## Skill maintenance

The host-provided `skill-creator` is the single authoring and update entry
point. This repository maintains no second methodology, proposal, review, or
ship lifecycle.

### New skill

1. Give `skill-creator` concrete positive, difficult, and
   scope-preservation examples.
2. Create `skills/<name>/` directly in a working branch.
3. Include only instructions and resources the agent would otherwise lack.
4. Run structural validation and realistic forward-tests.
5. Use `skill-eval` against `without_skill` for substantial behavior.
6. Keep the package only when artifacts show lift without regression.
7. Update INDEX and README, obtain human review, then use `commit-work`.

### Existing skill

1. Preserve the exact pre-change Git revision as the old-skill baseline.
2. Turn the observed failure into a realistic eval case.
3. Use `skill-creator` for the smallest root-complete package change.
4. Calibrate assertions after seeing both artifacts; reject assertions a
   clearly wrong artifact can satisfy.
5. Run `skill-eval` verify in clean paired contexts.
6. PASS permits human review, not automatic acceptance. FAIL requires another
   revision; NO_LIFT means no measured value; INCONCLUSIVE means no completion
   claim is justified.
7. Commit only the accepted package and current eval definition.

An eval-definition-only provenance or schema repair is not behavior lift.
Validate it deterministically, keep runtime instructions unchanged, and leave
behavior certification explicitly `INCONCLUSIVE` until clean current-package
evidence exists.

Global Codex, Claude Code, Cursor, OpenCode, and Cline installations are
runtime copies. Repository agents do not synchronize them.

## Tool and model policy

- Record the actual harness and model used for an eval or review.
- Compare baseline and treatment with equal prompt, model, permissions,
  fixtures, and limits.
- Prefer independent review context.
- Do not hard-code a model as a permanent workflow rule.

## Session continuity

Stay in one session while it remains reliable. Use `session-handoff` only
when exact unresolved state must survive a fresh window, harness switch, or
pause. Prefer existing durable artifacts when they already contain everything
needed to resume.

For an interrupted critical review, carry the exact current base/head, prior
reviewed head and complete report, review mode, open Root families, and
artifact/invariant coverage gaps. If no terminal report was produced, the
handoff must say so; partial diagnostics are not a verdict artifact.

## Boundaries

- No verdict authorizes commit, push, install, merge, or deployment.
- Review and eval judge current artifacts, not author identity or procedure
  claims.
- Global skill copies are not repository source of truth.
- Change this workflow from observed use or explicit human decisions.
