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

1. After the first `to-spec` save: paste `Use adversarial-spec-review`
   (`Cycle: first`), then `Use spec-readiness` (`Cycle: first`).
2. Paste `Use to-spec` (`Cycle: rewrite-1`) only after an in-lock first
   FAIL whose `Next` is `to-spec`. Do not paste it on PASS+READY or stop.
3. After that rewrite: paste the reprinted rewrite-1 review cards
   (`Prior` is the real first-cycle report paths). There is no second
   `to-spec` rewrite card.

Review writes `YYYY-MM-DD-HHMM-<skill>.md` under `Write report under:`
only when that field is on the pasted card (that implies a real hop).
No card: chat only.

### First save — three blocks

Human pastes the two review cards after this save. Human pastes the
`to-spec` rewrite card only after an in-lock first FAIL whose `Next` is
`to-spec`. Do not paste that rewrite card on PASS+READY or stop.

```text
Use adversarial-spec-review
Cycle: first
Lock: .workflow/<id>/YYYY-MM-DD-HHMM-task-groundwork.md
Spec: <spec folder>
Write report under: .workflow/<id>/
Report file: YYYY-MM-DD-HHMM-adversarial-spec-review.md
Read Spec and Lock whole. Isolated review. Do not implement. Do not edit spec or code.
```

```text
Use spec-readiness
Cycle: first
Lock: .workflow/<id>/YYYY-MM-DD-HHMM-task-groundwork.md
Spec: <spec folder>
Write report under: .workflow/<id>/
Report file: YYYY-MM-DD-HHMM-spec-readiness.md
Read Spec and Lock whole. Isolated review. Do not implement. Do not edit spec or code.
```

```text
Use to-spec
Cycle: rewrite-1
Lock: .workflow/<id>/YYYY-MM-DD-HHMM-task-groundwork.md
Spec: <spec folder>
Reports:
  .workflow/<id>/*-adversarial-spec-review.md
  .workflow/<id>/*-spec-readiness.md
Read Spec, Lock, and those report files whole (newest of each skill unless a path is named). The files win. One rewrite in place. Do not implement. Do not edit code.
```

### After in-lock rewrite — two blocks

Reprint only these two. Set `Prior:` to the real first-cycle report paths
from a glob under `.workflow/<id>/` (names without `-rewrite-1`). Do not
guess a path. If the glob is empty, omit `Prior:` rather than inventing
one. Do not emit a second `to-spec` rewrite card.

`Report file` uses the current local minute. Same minute plus same skill
plus rewrite-1: the review adds a `-rewrite-1` suffix when it writes.

```text
Use adversarial-spec-review
Cycle: rewrite-1
Lock: .workflow/<id>/YYYY-MM-DD-HHMM-task-groundwork.md
Spec: <spec folder>
Write report under: .workflow/<id>/
Report file: YYYY-MM-DD-HHMM-adversarial-spec-review.md
Prior: <globbed first-cycle adversarial-spec-review report path>
Read Spec and Lock whole. Isolated review. Do not implement. Do not edit spec or code.
```

```text
Use spec-readiness
Cycle: rewrite-1
Lock: .workflow/<id>/YYYY-MM-DD-HHMM-task-groundwork.md
Spec: <spec folder>
Write report under: .workflow/<id>/
Report file: YYYY-MM-DD-HHMM-spec-readiness.md
Prior: <globbed first-cycle spec-readiness report path>
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
needed to resume. `session-handoff` is not a review report and does not
replace `.workflow/` hop artifacts.

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
