# Personal Multi-Session Workflow

This document records the stable working method used with this skill
repository. The workflow is the durable part. Agent surfaces, providers,
models, windows, and individual skills may change as experiments produce
better options.

## Core rule

Separate designing, reviewing, implementing, and shipping into different
sessions. Carry the exact artifact and verdict between sessions; do not rely on
memory or let one session silently take over another session's responsibility.

Different sessions may use different tools and models. Model choices are
experimental metadata, not workflow rules. When practical, review uses a
separate session and an independent model from the session that created the
artifact.

## Canonical flow

```text
DESIGN SESSION
authoritative task description or direct user request
      ↓
task-groundwork
      ↓
to-spec
      ↓
REVIEW SESSION
adversarial-spec-review
      ├─ FAIL → DESIGN SESSION
      │          revise-spec-from-review
      │                ↓
      │          adversarial-spec-review again
      └─ PASS
            ↓
spec-readiness
      ├─ FAIL → DESIGN SESSION
      │          revise-spec-from-review
      │                ↓
      │          spec-readiness again
      └─ PASS
            ↓
IMPLEMENTATION SESSION
senior-implementer
      ↓
REVIEW SESSION (compliance)
review-implementation
(skip when no approved spec cluster path was handed to implementation)
      ├─ FAIL → senior-implementer
      │          complete findings → bounded fixes
      │                ↓
      │          review-implementation again
      └─ Ready-for-PR: Yes
            ↓
COMMIT / PR SESSION
commit-work → pr-branch as needed
      ↓
REVIEW SESSION (hostile)
risk-calibrated-pr-review
(opened PR required; result bound to exact base/head)
      ├─ FAIL → senior-implementer
      │          complete findings → bounded fixes
      │          invalidate Ready-for-PR if impl changed
      │          → review-implementation again when named spec
      │          → risk-calibrated-pr-review again
      ├─ INCOMPLETE → gather named evidence / resolve boundary
      │                → risk-calibrated-pr-review again
      └─ PASS → human-owned merge decision
```

For sticky undecided product or design forks, optionally run `grill-me` before
or during groundwork; it is not a required node on this path.

## Session responsibilities

| Session | Owns | Must not absorb |
|---|---|---|
| Design | Grounding the task, resolving decisions, writing the spec, applying verified spec-review corrections | Implementation, PR creation, merge |
| Review | Spec compliance (`review-implementation`), hostile spec review (`adversarial-spec-review`), risk-calibrated PR review (`risk-calibrated-pr-review`), readiness judgment, evidence-backed verdict | Quietly rewriting the reviewed artifact or approving its own fixes or merge |
| Implementation | `senior-implementer`: implementing the approved spec/brief and applying bounded corrections from complete compliance or diff-review findings | Redesigning the spec, opening the PR, merging |
| Commit / PR | Staging intentional changes, creating commits, writing the PR description, opening the PR | Implementation changes, independent review, merge |
| Human | Choosing tools/models, approving scope changes, deciding commit/push/install/merge | Delegating irreversible authority merely because a score or review passed |

## Skill input contract

The human-facing input to each skill is intentionally small and concrete.
These are the inputs supplied when starting the skill; the skill may inspect
the repository or Git for additional evidence within its own responsibility.

| Skill | Explicit input |
|---|---|
| `task-groundwork` | Any authoritative task description or direct user request; roadmap path and task number are common, not required |
| `to-spec` | `task-groundwork` result or equivalent grounded frame (see Spec design loop skip rule), plus conversation and other authoritative task artifacts for one bounded software change |
| `adversarial-spec-review` | Spec cluster path |
| `revise-spec-from-review` | Complete output from the failed `adversarial-spec-review` or `spec-readiness` run |
| `spec-readiness` | Spec cluster path |
| `senior-implementer` | Approved spec/brief path when present; for post-review correction, also the **complete** findings output from `review-implementation` or `risk-calibrated-pr-review` (not a paraphrase)—stop and ask if findings are missing or only summarized |
| `review-implementation` | Approved spec cluster path (named-spec compliance; optional changed-files/PR argument as the skill allows) |
| `commit-work` | No explicit input; inspect the current Git worktree and diff |
| `pr-branch` | No explicit input; inspect the current branch, commits, and Git diff |
| `risk-calibrated-pr-review` | Current PR number or URL; on eligible incremental re-review, the complete prior report and its exact reviewed head |
| `adversarial-diff-review` | Explicit branch or working-tree diff boundary when hostile review is needed before a PR exists; not chained with the canonical PR gate |
| `skill-brief` | Skill-design intent or incomplete checklist; may use bounded grill-me |
| `skill-router` | Required `job` text; optional `exclude` skill-name list |
| `skill-composition` | Exactly one of `target`, `proposal_path`, or `fixture_path` |
| `skill-path-selector` | Completed selector checklist (via `skill-brief` when incomplete) |
| `skill-design-loop` | Explicitly supplied skill-design intent or partial/complete checklist; orchestrates through draft and stops |
| `skill-draft-ship` | Complete checklist + selected path for draft mode, or purpose_pass draft path + explicit human ship + composition_ok or human composition skip |
| `skill-review` | `.skill-proposals/<skill_name>/` plus checklist purpose fields |
| `revise-skill-from-review` | Draft path plus complete purpose_fail remedies |

Do not replace these artifact references with a summary from memory. A review
failure is handed back as its complete output, and a spec-consuming skill
receives the spec cluster itself rather than a paraphrase of it.

When unsure which **existing** catalog skill fits the current job, optionally
run `skill-router` for a single recommendation (`skill` | `none` | `blocked`).
It does not replace WORKFLOW session transitions or propose skill chains.

Before shipping a skill, `skill-draft-ship` ship mode requires a
`composition_ok` verdict from `skill-composition` on the current draft (or an
explicit human composition skip with reason). Composition is an artifact
prerequisite of ship, not a substitute for `skill-review` purpose judgment.
It may also be run independently on any draft or catalog skill.

## Exact transitions

### Spec design loop

1. Run `task-groundwork` on the authoritative task description or direct user
   request, unless the skip rule applies. Skip `task-groundwork` only when the
   design session already contains a written grounded frame that states all of:
   (a) task identity/authority source, (b) in-scope outcome, (c) explicit
   out-of-scope or non-goals, (d) acceptance or stop conditions for the next
   stage. A roadmap or ticket id alone is never enough.
2. Run `to-spec` with that groundwork result (or equivalent grounded frame) plus
   conversation and other authoritative task artifacts for one bounded software
   change.
3. Give the resulting spec cluster path to `adversarial-spec-review`.
4. On failure, return the spec and complete review findings to the design
   session. Use `revise-spec-from-review`, then rerun
   `adversarial-spec-review` in **incremental** mode against that same report.
   Shared closure unit: Root cluster + Consequence surface on the **findings
   report**; revise is judged by the **updated spec**; re-review judges that
   spec (not process claims). `PASS` / `READY` still require zero P0/P1 or
   Blockers, including residual and `new-out-of-batch` hits listed once without
   reopening resolved families. Verify the pair with package evals
   (`adversarial-spec-review/evals/incremental-closure`,
   `revise-spec-from-review/evals/closure`) drawn from real session failures —
   not by trusting instruction-following prose. Do not mandate a full
   `task-groundwork` re-run unless the findings invalidate the grounded frame
   (task identity, scope, or acceptance); if they do, re-ground then continue.
5. On pass, run `spec-readiness` with the spec cluster path.
6. On readiness failure, return the spec and readiness findings to the design
   session. Use `revise-spec-from-review`, then rerun `spec-readiness`
   incrementally under the same artifact rules (prior families + neighbors;
   no partition reinvention; zero Blockers for `READY`). Same re-ground rule
   as step 4.
7. Only a passing spec review and passing readiness result permit handoff to
   implementation.

### Implementation and PR loop

1. **Start implementation.**
   - **Named spec:** Start a separate implementation session with the approved
     spec cluster path (directory or primary file). A roadmap or ticket id or
     chat bullets without that path are not a named spec. Use
     `senior-implementer` with that path. Do not open the PR inside the
     implementation session.
   - **No named spec** (docs-only, skill-kit prose, conversation-only work):
     Implement without requiring `senior-implementer` or a spec cluster path.
     Skip compliance (`review-implementation`). Do not open the PR inside the
     implementation work either.
2. **Compliance (named spec only):** Skip this step when there is no named
   spec. Otherwise, in a separate review session, run
   `review-implementation` against the approved spec cluster path. On
   compliance FAIL, return the **complete** findings to `senior-implementer`
   (with the spec/brief path) for bounded fixes as a closed worklist, then
   rerun `review-implementation`. Do not open the PR while compliance is
   failed or not yet run when a named spec exists.
3. Start a separate commit/PR session when Ready-for-PR is Yes (or when there
   is no named spec). Invoke `commit-work`, then `pr-branch` as needed.
4. **Hostile PR gate:** In a separate review session, run
   `risk-calibrated-pr-review` against the opened PR. It establishes the exact
   base/head, infers impact criticality, and returns `PASS`, `FAIL`, or
   `INCOMPLETE`. On the named-spec path, this does not replace the pre-PR
   compliance review. Before a PR exists, `adversarial-diff-review` may be
   invoked separately for an explicit branch/worktree boundary, but it is not
   chained with or substituted for the canonical PR gate.
5. On `FAIL`, return the **complete** findings to
   `senior-implementer` (spec/brief path when present, else session task
   authority) for bounded corrections. Any implementation change after a Yes
   Ready-for-PR **invalidates** that Yes until `review-implementation` is
   re-run and returns Yes again (named-spec path only); then rerun
   `risk-calibrated-pr-review` against the updated PR.
6. On `INCOMPLETE`, gather the report's named required evidence or resolve its
   task/PR boundary. Do not translate missing proof into an implementation
   defect. If closing the gap changes implementation, apply the same
   Ready-for-PR invalidation and compliance rerun from step 5, then rerun
   `risk-calibrated-pr-review`.
7. Only `PASS` on the exact current head returns the decision to the human. It
   does not merge automatically. Ready-for-PR: Yes does not authorize merge
   and does not replace the PR-gate pass.

### Which implementation review

These are sequential roles on the named-spec path, not a pick-one chooser:

| Role | Skill | When |
|---|---|---|
| Spec × code compliance + known-pitfall sweep; Ready-for-PR | `review-implementation` | Named spec present; after implement, before opening the PR |
| Consequence-calibrated hostile PR review; shipping / merge gate | `risk-calibrated-pr-review` | After the PR opens; never the sole pre-PR review when a named spec exists |

If the user invokes only one review skill by name, run only that skill. Vague
“review this” with no spec path and no diff/PR → `skill-router` may return
`none`; do not invent a default.

### Skill design loop

Prefer methodology-bound skills. **Never author a new skill's SKILL.md before
`methodology-selector` returns a contract for that skill's purpose** (no
method-name bias in the request). Drafts live under gitignored
`.skill-proposals/`; canonical packages live under `skills/` only after ship.

1. Explicitly invoke `skill-design-loop` with a skill idea or checklist. It
   resolves the active repository and reads sibling contracts only from that
   repository's `skills/`; global installations are activation copies, never
   source or fallback.
2. In the same task, `skill-design-loop` applies `skill-brief` when the
   checklist is incomplete. `skill-brief` owns intake and may use `grill-me`
   under brief bounds (field-scoped, one question at a time, default max 8).
3. Intake returns the selector checklist without invented fields: purpose,
   audience, when_to_use, when_not, success_signal, boundaries, context,
   output_format, skill_name, skill_summary; optional invocation; and
   `replace: none | proposal | shipped | both`.
4. The orchestrator applies `skill-path-selector` →
   `methodology` | `decompose` | `procedural` | `blocked`. Child normal stops
   return to the orchestrator; human-input stops remain in the current stage.
5. On `decompose` or `blocked`, stop without writing. On `methodology` or
   `procedural`, invoke `skill-draft-ship` draft mode with the complete
   checklist and selected path. Methodology rendering goes directly through
   `methodology-skill-creator`, never `loop-orchestrator`.
6. `skill-draft-ship` **draft** writes only
   `.skill-proposals/<skill_name>/`; any replacement requires target-specific
   human authority. `skill-design-loop` stops with the typed draft handoff.
7. Separate session: `skill-review` on that draft path.
8. On `purpose_fail`, `revise-skill-from-review` then re-run `skill-review`.
9. On `purpose_pass`, human **ship** → `skill-draft-ship` ship mode requires
   `composition_ok` from `skill-composition` on the current draft (or an
   explicit human composition skip with reason) → copy → INDEX/README →
   delete draft last. Replacing an existing shipped package requires a fresh
   explicit `ship_replace: true` approval in that ship attempt.
10. Install/global remains human-owned. After ship, behavior complaints use
    `tune-skill`, not `skill-review`.

Checklist → eight-field map: purpose→task; audience→audience; context→context;
output_format→output_format; success_signal→validation check + evidence;
boundaries→stop_conditions with `human_approval_required: true` and
`approval_actions` including `ship skill to skills/`; skill_name /
skill_summary / invocation / replace stay draft inputs.

#### Lifecycle package selections (purpose-first)

Recorded under `skills/lifecycle-build/selections/` before each SKILL.md:

| Package | methodology-selector | Notes |
|---|---|---|
| `skill-brief` | `five-w-two-h` | Checklist operating frame; bounded grill-me tool use |
| `skill-router` | `decision-matrix` | Single catalog skill pick, or none/blocked |
| `skill-composition` | `none` (procedural) | Invoke/forbid/require consistency check |
| `skill-path-selector` | `decision-matrix` | Path choice among options with criteria |
| `skill-review` | `smart-goals` | Draft judged as measurable finishability |
| `revise-skill-from-review` | `pdca` | Bounded change inside review/revise cycles |
| `skill-design-loop` | `none` (procedural orchestrator) | Explicit preflight/intake/path/draft routing |
| `skill-draft-ship` | `none` (procedural harness) | Renamed continuation of the historical `skill-creator`; persist/ship gates only |

## Tool and model policy

- Session type is stable; tool and model selection is replaceable.
- Do not hard-code a provider, product, or model name into the workflow.
- Record the actual surface and model used in each session so later comparisons
  are evidence-based.
- A stronger or newer model may replace an older choice without changing the
  workflow.
- Prefer independent review context. Do not let the implementation session
  certify its own diff merely because it uses a capable model.
- Low-cost models may be tested for bounded commit/PR work; design,
  implementation, and review models may be chosen separately.

## Optional session continuity

Goal-oriented runs often stay in one session until the goal completes; the
agent may compact or summarize internally along the way. That is the default.
Do not require a handoff document or YAML record after every session.

Use `session-handoff` only when you need a **controlled** resume packet for a
fresh window or tool — for example mid-work context pressure, switching
surfaces, or pausing overnight — instead of relying on opaque compact/summarize
output. Prefer durable artifacts already produced by the workflow (spec,
review findings, diff, PR, loop run record) when those are enough to continue.

When a handoff doc already exists, treat it as optional evidence. If you want a
compact checklist for a session-type change, this shape is enough; it is not a
mandatory schema and need not match the markdown sections `session-handoff`
writes:

```yaml
task: <stable task identifier and outcome>
session_type: design | review | implementation | commit-pr
surface: <tool used in this session>
model: <model used in this session>
model_choice_reason: <optional experiment or task-fit reason>
input_artifacts:
  - <roadmap task, spec, review report, diff, or PR>
skill_used: <exact skill name>
result: pass | fail | blocked | completed | review-required
evidence:
  - <commands, findings, artifact paths, or check results>
open_findings:
  - <unresolved item, if any>
next_session: <exact session type>
next_skill: <exact skill name or human action>
human_action_required: <scope, commit, push, install, merge, or none>
```

## Skill-improvement observation loop

The workflow stays stable, but its skills are expected to evolve.

No separate recorder or mandatory per-session log is required. When a skill
issue matters, use evidence the workflow already produced:

- the current chat or session history;
- adversarial review and readiness reports;
- roadmap, groundwork, spec, diff, commit, and PR artifacts;
- a `session-handoff` document when one already exists.

Useful problem signals include:

- a skill repeatedly misunderstood the same instruction;
- review findings were not applied accurately;
- important context had to be copied manually every time;
- the wrong session tried to take ownership;
- a model/tool combination performed unusually well or poorly;
- the same workaround was needed in several tasks;
- a review or readiness gate repeatedly found the same class of defect.

A single observation is a clue, not an automatic skill defect. There is no
numeric task threshold: use `tune-skill` when the complaint can be reproduced
or verified against available artifacts. Repetition across tasks strengthens
confidence but is not a mandatory gate.

When an issue warrants investigation:

1. Identify the responsible skill and the concrete failed behavior.
2. Separate one-off model mistakes from reproducible skill-instruction defects.
3. Preserve or link the available failed input, observed output, workaround,
   and later verdict.
4. Use methodology selection, goal engineering, readiness, and run records when
   an improvement is broad enough to need a controlled loop.
5. Use `tune-skill` for a concrete, reproducible behavior complaint on an
   already shipped skill.
6. Add a new skill through the Skill design loop when the responsibility is
   genuinely distinct; run `methodology-selector` on the purpose before writing
   SKILL.md. Create-loop purpose failures use `revise-skill-from-review` on
   drafts — do not overload `tune-skill` for unshipped proposals.
7. Require human review before changing the repository source of truth.

`revise-spec-from-review` is paired with `adversarial-spec-review` /
`spec-readiness` through artifact handoff (findings report → updated spec →
re-review of that spec). Improve the pair with eval-driven checks on fixtures
taken from real session failures — grade produced artifacts, not claimed
steps. Package evals:
`skills/adversarial-spec-review/evals/incremental-closure`,
`skills/revise-spec-from-review/evals/closure`.

## Boundaries

- This workflow is not tied to one model, provider, editor, or agent surface.
- It does not schedule or monitor sessions automatically.
- It does not automatically edit skills from a single observation.
- It does not replace independent review with self-review.
- It does not turn `ready`, `pass`, or `review-required` into commit, push,
  install, merge, or deployment permission.
- Changes to this workflow should reflect repeated evidence or an explicit
  human decision, not tool fashion.
