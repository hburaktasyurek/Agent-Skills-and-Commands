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
→ commit-work                   # exact spec revision for review
→ adversarial-spec-review + spec-readiness
→ senior-implementer
→ review-implementation        # named-spec work only
→ commit-work                   # implementation
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

## Spec design

Orchestrator contract. The OMP runtime spec gate is `omp-task-to-spec`; this
file is the human contract, and the edges live in that skill.

The five spec-path packages ship the identical boundary file under
`references/outcome-lock.md`. Use a landed owner/path when it already owns the
needed result; do not rebuild that machine inside the current task.

1. Use `task-groundwork` unless the session already states the outcome lock,
   scope/non-goals, and acceptance or stop conditions.
2. Any phase may raise a necessary question. Preserve its substance, ask in
   plain speech, and wait. Continue the conversation until the issue is resolved
   or the human chooses `stop`. Freeze resolved answers and resume from the
   first phase whose output must be regenerated; if no output was invalidated,
   resume the interrupted phase. Do not ask what available evidence can decide,
   and do not silently answer or discard another agent's question.
3. `to-spec` writes every spec byte. Parent, review, and ad-hoc hole-closing
   do not write spec files.
4. Inspect the exact `to-spec` output before commit. If it raises a question,
   use the question protocol and do not commit. After resolution, rerun
   `task-groundwork` or `to-spec` when its authority or artifact changed;
   otherwise resume the commit.
5. Run `adversarial-spec-review` and `spec-readiness` independently against
   the same committed spec revision.
6. The gate closes only on PASS + READY. There is no review-round or rewrite
   counter.
7. After any FAIL or NOT READY, inspect both complete reports before rewriting.
   Resolve any question first, then resume from the first affected phase.
   If no question remains, return both reports to `to-spec`; it rewrites the
   same spec identity root-completely, the rewrite is committed, and both gates
   rerun against that exact revision. Continue while current evidence proves a
   P0/P1 or structural Blocker; stop the loop as soon as none remains.
8. If the spec invented unsupported architecture, ownership, or a parallel
   machine, `to-spec` removes it or uses the landed owner/path when the frozen
   lock decides that closure. Ask the human only when missing or contradictory
   binding authority leaves a real create/replace/cancel, durable-store, or
   lock-enlargement choice open. A reviewer's opinion is not that authority.
9. Any spec rewrite invalidates both prior gate verdicts. A repeated root,
   prior FAIL, or review count is neither a finding nor a reason to stop.
10. Hand off only after both gates pass.

Spawn carries the frozen outcome lock. It does not add path-specific bans
(for example "no PaymentAttempt", "do not call X").

Step back / "remove this" returns to `task-groundwork`. Do not offer a
repository or catalog menu as a substitute.

Questions may come from the parent, any child, either reviewer, or the commit
agent. Preserve the producer's concrete question, evidence, viable choices,
and consequences; wait for the human and continue the conversation while the
issue remains open. After resolution, changed task outcome/scope/owner/Outcome
lock returns to `task-groundwork`; changed spec contract returns to `to-spec`;
otherwise resume the interrupted phase.

Incremental spec re-review requires the complete prior report and matching
artifact basis, unchanged task contract, and changes bounded to the prior
closure surface. Otherwise reset to full review. A root missed by the prior
review or introduced by the rewrite stays incremental and batches related
same-outcome roots; it is not an unrelated full re-sweep.

## Spec hop

The hop and `.workflow/` sidecars are for the multi-session spec path, not
for tiny or already-narrow tasks.

Carry the next skill as one pasted block. Full briefs and (carded) review
reports live under `.workflow/`; do not paste those bodies into the next
chat. `.handoff/` remains only `session-handoff`. `session-handoff` is not
a review report.

`task-groundwork` writes `.workflow/YYYY-MM-DD-HHMM-task-groundwork.md`
and still returns the brief in chat, except when it returns the existing
negative-fit / already-narrow brief. That case writes no sidecar.

`to-spec` only writes the four-file spec and stops. After it returns the
spec folder, the same session — not the `to-spec` skill — copies the
same-session `.workflow/YYYY-MM-DD-HHMM-task-groundwork.md` unchanged into
`.workflow/<spec-folder-basename>/`, keeping its filename, and prints the
paste cards below. Do not rewrite the brief. `Lock:` on every card is that
copied file.

If there is no sidecar, do not copy a lock file, do not print paste cards,
and do not tell the human to paste review cards. The same session can go
to spec or direct execution without `.workflow/`.

Paste one block at a time. Fill `<id>` with the spec folder basename,
`<spec folder>` with the spec path, and clock fields from the **local**
`YYYY-MM-DD-HHMM`.

Do not add `Goal`, a correction recipe, a lock summary, or any line that
is not in the templates below. Start every card with `Use` and exactly
one of: `adversarial-spec-review`, `spec-readiness`, `to-spec`. Do not
put other skill or workflow names on the card. `Write report under:`
appears only on review cards.

Which card:

1. After the first `to-spec` save, paste both review cards.
2. After any in-lock FAIL or NOT READY whose `Next` is `to-spec`, paste the
   `to-spec` rewrite card with both latest complete reports.
3. After every rewrite, paste both review cards again. Set each `Prior:` to
   that skill's latest complete report. Repeat until the same committed spec
   revision receives PASS + READY or an unresolved question pauses the flow.

Review writes `YYYY-MM-DD-HHMM-<skill>.md` under `Write report under:`
only when that field is on the pasted card (that implies a real hop).
No card: chat only.

### Initial review and rewrite blocks

Human pastes the two review cards after the first save. Paste the `to-spec`
rewrite card only after an in-lock FAIL or NOT READY whose `Next` is `to-spec`.
Do not paste it on PASS + READY or while any necessary question is unresolved.

```text
Use adversarial-spec-review
Lock: .workflow/<id>/YYYY-MM-DD-HHMM-task-groundwork.md
Spec: <spec folder>
Write report under: .workflow/<id>/
Report file: YYYY-MM-DD-HHMM-adversarial-spec-review.md
Read Spec and Lock whole. Isolated review. Do not implement. Do not edit spec or code.
```

```text
Use spec-readiness
Lock: .workflow/<id>/YYYY-MM-DD-HHMM-task-groundwork.md
Spec: <spec folder>
Write report under: .workflow/<id>/
Report file: YYYY-MM-DD-HHMM-spec-readiness.md
Read Spec and Lock whole. Isolated review. Do not implement. Do not edit spec or code.
```

```text
Use to-spec
Lock: .workflow/<id>/YYYY-MM-DD-HHMM-task-groundwork.md
Spec: <spec folder>
Reports:
  .workflow/<id>/*-adversarial-spec-review*.md
  .workflow/<id>/*-spec-readiness*.md
Read Spec, Lock, and those report files whole (newest complete report from each skill unless a path is named). The files win. Rewrite the same spec identity in place and close every current in-lock root family in one pass. Do not implement. Do not edit code.
```

### Re-review after every in-lock rewrite — two blocks

Reprint only these two after a rewrite. Set `Prior:` to each skill's latest
complete report path from `.workflow/<id>/`; do not guess a path. If no prior
report exists, omit `Prior:` rather than inventing one. A later in-lock FAIL or
NOT READY uses the same rewrite block above with the new latest reports.

`Report file` uses the current local minute. If that name exists, the review
adds the lowest available `-2`, `-3`, and so on.

```text
Use adversarial-spec-review
Lock: .workflow/<id>/YYYY-MM-DD-HHMM-task-groundwork.md
Spec: <spec folder>
Write report under: .workflow/<id>/
Report file: YYYY-MM-DD-HHMM-adversarial-spec-review.md
Prior: <latest complete adversarial-spec-review report path>
Read Spec and Lock whole. Isolated review. Do not implement. Do not edit spec or code.
```

```text
Use spec-readiness
Lock: .workflow/<id>/YYYY-MM-DD-HHMM-task-groundwork.md
Spec: <spec folder>
Write report under: .workflow/<id>/
Report file: YYYY-MM-DD-HHMM-spec-readiness.md
Prior: <latest complete spec-readiness report path>
Read Spec and Lock whole. Isolated review. Do not implement. Do not edit spec or code.
```

### `.workflow/` and Git

`.workflow/` may be committed on the task branch while that branch
exists. It must not land on the default branch. Git has no merge
path-exclude; `export-ignore` and `merge=ours` do not keep new files
off the default branch. Drop `.workflow/` after merge or before squash.
Deleting the feature branch loses lookback. This repository does not
gitignore or CI-exclude `.workflow/`.

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
4. Run structural validation and test any deterministic scripts directly.
5. Inspect the exact package diff and use observed real-task behavior when it
   exists; do not replace missing real evidence with a scored simulation.
6. Update INDEX and README, obtain human review, then use `commit-work`.

### Existing skill

1. Start from the observed real-use failure and inspect the exact current
   package and pre-change Git revision.
2. Use `skill-creator` for the smallest root-complete package change, except
   when the job or ontology itself changed — then rewrite the job.
3. Run structural validation and test any changed deterministic scripts.
4. Inspect the exact diff against the observed failure and adjacent runtime
   contracts. Use later real-task outcomes to recalibrate the skill.
5. Commit only the human-accepted package.

This repository does not run model-judged evals, synthetic eval cases, baseline
comparisons, or `skill-eval` for skill maintenance. A high eval score does not
establish reliable behavior in real work. When current real-task evidence is
unavailable, state that the behavior is not yet observed; do not manufacture
certainty with an eval. The standalone `skill-eval` package retains only its
own self-test fixtures and is not a repository maintenance gate.

Global Codex, Claude Code, Cursor, OpenCode, and Cline installations are
runtime copies. Repository agents do not synchronize them.

## Tool and model policy

- Record the actual harness and model used for a review when it matters to the
  evidence.
- Prefer independent review context.
- Do not hard-code a model as a permanent workflow rule.

## Session continuity

Stay in one session while it remains reliable. Use `session-handoff` only
when exact unresolved state must survive a fresh window, harness switch, or
pause. Prefer existing durable artifacts when they already contain everything
needed to resume. `session-handoff` is not a review report and does not
replace `.workflow/` hop artifacts.

For an interrupted critical review, carry the exact current base/head, prior
reviewed head and complete report, review mode, open Root families, and
artifact/invariant coverage gaps. If no terminal report was produced, the
handoff must say so; partial diagnostics are not a verdict artifact.

## Boundaries

- No verdict authorizes commit, push, install, merge, or deployment.
- Review judges current artifacts, not author identity or procedure claims.
- Global skill copies are not repository source of truth.
- Change this workflow from observed use or explicit human decisions.
