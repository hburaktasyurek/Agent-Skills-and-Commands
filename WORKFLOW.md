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
→ pr-branch                    # open when a PR is wanted
→ risk-calibrated-pr-review    # opened PR only
→ human merge decision
```

`grill-me` is optional for unresolved design forks. Use
`adversarial-diff-review` when hostile review is useful before opening a PR;
it does not replace the opened-PR gate.

## Responsibilities

| Role | Owns | Must not absorb |
|---|---|---|
| Design | Grounding, product decisions, specs (`to-spec` is the only spec-byte author) | Implementation, PR creation, merge |
| Review | Spec attack, readiness, spec-code compliance, PR attack | Editing the reviewed artifact or approving its own corrections |
| Implementation | Root-complete delivery of the task or complete findings, including task-owned spec reconciliation when current evidence invalidates it | Unrelated redesign, PR creation, merge |
| Commit / PR | Intentional commits, PR description, requested publication | Implementation or independent review |
| Human | Scope changes and commit/push/install/merge authority | Treating an automated verdict as irreversible permission |

## Artifact inputs

| Skill | Required input |
|---|---|
| `task-groundwork` | Authoritative task description or direct request |
| `to-spec` | Grounded frame or equivalent current evidence |
| `adversarial-spec-review` | Current spec cluster |
| `spec-readiness` | Current spec cluster |
| `senior-implementer` | Approved spec/brief or direct task; complete findings when correcting review failures |
| `review-implementation` | Approved named spec and current implementation |
| `adversarial-diff-review` | Explicit branch/worktree/diff boundary |
| `commit-work` | Current Git worktree |
| `pr-branch` | Current branch and confirmed base |
| `risk-calibrated-pr-review` | Current PR; complete prior report/head for eligible incremental review |
| `skill-eval` | Current skill path, exact baseline, eval definition, one harness and model |

## Spec design

Orchestrator contract. Host harnesses that still run a 3-cycle revise ladder
are out of scope; this package does not patch them. The OMP runtime spec
gate is `omp-task-to-spec`; this file is the human contract, and the edges
live in that skill.

The four design skills ship the identical lock file under
`references/outcome-lock.md`. Review closes only by calling a landed
substrate or escalating the gap to its owner.

1. Use `task-groundwork` unless the session already states the outcome lock,
   scope/non-goals, and acceptance or stop conditions.
2. `to-spec` writes every spec byte. Parent, review, and ad-hoc hole-closing
   do not write spec files.
3. Run `adversarial-spec-review` independently.
4. One attack pair. Shared cycle is `first | rewrite-1 | stop`. There is no
   `1/3`–`3/3` ladder.
5. In-lock hole on `first`: `to-spec` rewrites once; re-enter review as
   `rewrite-1`. Second FAIL is `stop` → human. Do not send another rewrite.
6. Architecture, lock enlargement, a new durable store, or a
   create/replace/cancel *request* (not a reviewer's `necessity=` stamp) →
   human or catalog. No patch.
7. After adversarial PASS, run `spec-readiness`. Same edges: in-lock →
   `to-spec` once; architecture/lock growth → human; READY → implement.
   Readiness does not reuse a previous PASS on a different artifact.
8. Hand off only after both gates pass.

Spawn carries the frozen outcome lock. It does not add substrate bans
(for example "no PaymentAttempt", "do not call X").

Step back / "remove this" returns to `task-groundwork`. Do not offer a
repository or catalog menu as a substitute.

`ask()` passes the skill's K2 enum unchanged (`call-substrate` /
`own-in-child` / `defer-new-child` / `stop`). Do not rewrite options.

Incremental spec re-review requires the complete prior report and matching
artifact basis, unchanged task contract, and changes bounded to the prior
closure surface. Otherwise reset to full review. A prior-review gap or
revision-induced root stays incremental and batches same-outcome siblings;
it is not an unrelated full re-sweep.

## Implementation and PR

1. For a named spec, give the exact spec cluster to `senior-implementer`.
   For a direct task, the current request is sufficient authority.
2. The first named-spec implementation must pass `review-implementation`
   before its PR is opened. Bind that
   receipt to the spec-file hashes, implementation HEAD, and staged/unstaged
   plus relevant-untracked fingerprint. It is a pre-PR receipt, not a recurring
   gate after that PR exists.
3. Use `commit-work`; use `pr-branch` when a PR is first requested.
4. Run `risk-calibrated-pr-review` against the exact opened PR revision.
5. On FAIL, always return complete findings to `senior-implementer`. The
   implementer verifies or refutes each finding, reconciles any task-owned stale
   spec with the implementation inside the existing outcome and scope, and
   asks only for a real human decision. After accepted corrections, commit and
   push when separately authorized, then rerun PR review. Do not rerun
   `review-implementation` or refresh PR metadata merely because another
   correction was pushed.
6. On INCOMPLETE, gather named evidence. Implementation changes trigger the
   current PR-review invalidation and rerun rules.
7. Before an intended final merge-gate review, inspect current PR metadata. Run
   `pr-branch` refresh only when the title/body still claims a superseded
   mechanism, outcome, scope, non-goal, material artifact, validation result,
   or mismatched base/head. If refreshed, run the terminal PR review afterward
   against the current metadata and exact head.
8. PASS returns the merge decision to the human; it never merges.

The correction loop is therefore:

```text
senior-implementer
→ commit-work / push           # only when separately authorized
→ risk-calibrated-pr-review
```

Spec review, readiness, first implementation review, and PR review results are
gate receipts for exact artifacts, not durable approval of a task name. After
the PR exists, a changed spec cluster, implementation basis, or PR head
invalidates the current PR-review verdict; it does not restart the pre-PR flow.

Incremental PR re-review requires the exact prior report/head, stable base and
task, provable ancestry and bounded delta, adequate prior coverage, and no new
impact surface or material invariant. Otherwise reset to full review.

## Skill maintenance

The host-provided `skill-creator` is the single authoring and update entry
point. This repository maintains no second methodology, proposal, review, or
ship lifecycle.

Ontology or job-definition cuts rewrite the skill. Do not patch compensating
paragraphs onto a prior freeze. `skill-creator`'s smallest-package default
does not apply to those cuts.

### New skill

1. Give `skill-creator` concrete positive, difficult, and
   scope-preservation examples.
2. Create `skills/<name>/` directly in a working branch.
3. Include only instructions and resources the agent would otherwise lack.
   Those files live inside that directory. Do not add `skills/*.md` or
   `../` reads; copy a shared ontology into each consumer's `references/`.
4. Run structural validation and realistic forward-tests.
5. Use `skill-eval` against `without_skill` for substantial behavior.
6. Keep the package only when artifacts show lift without regression.
7. Update INDEX and README, obtain human review, then use `commit-work`.

### Existing skill

1. Preserve the exact pre-change Git revision as the old-skill baseline.
2. Turn the observed failure into a realistic eval case.
3. Use `skill-creator` for the smallest root-complete package change, except
   when the job or ontology itself changed — then rewrite the job.
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
