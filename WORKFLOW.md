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
COMMIT / PR SESSION
commit-work
      ↓
pr-branch
      ↓
REVIEW SESSION
adversarial-diff-review
      ├─ FAIL → IMPLEMENTATION SESSION
      │          bounded correction from review findings
      │                ↓
      │          adversarial-diff-review again
      └─ PASS → human-owned merge decision
```

## Session responsibilities

| Session | Owns | Must not absorb |
|---|---|---|
| Design | Grounding the task, resolving decisions, writing the spec, applying verified spec-review corrections | Implementation, PR creation, merge |
| Review | Hostile review of the spec or diff, readiness judgment, evidence-backed verdict | Quietly rewriting the reviewed artifact or approving its own fixes |
| Implementation | Implementing the approved spec and applying bounded diff-review corrections | Redesigning the spec, opening the PR, merging |
| Commit / PR | Staging intentional changes, creating commits, writing the PR description, opening the PR | Implementation changes, independent review, merge |
| Human | Choosing tools/models, approving scope changes, deciding commit/push/install/merge | Delegating irreversible authority merely because a score or review passed |

## Skill input contract

The human-facing input to each skill is intentionally small and concrete.
These are the inputs supplied when starting the skill; the skill may inspect
the repository or Git for additional evidence within its own responsibility.

| Skill | Explicit input |
|---|---|
| `task-groundwork` | Roadmap file path and task number |
| `to-spec` | Complete `task-groundwork` output |
| `adversarial-spec-review` | Spec cluster path |
| `revise-spec-from-review` | Complete output from the failed `adversarial-spec-review` or `spec-readiness` run |
| `spec-readiness` | Spec cluster path |
| `senior-implementer` | Approved spec cluster path |
| `commit-work` | No explicit input; inspect the current Git worktree and diff |
| `pr-branch` | No explicit input; inspect the current branch, commits, and Git diff |
| `adversarial-diff-review` | PR number |

Do not replace these artifact references with a summary from memory. A review
failure is handed back as its complete output, and a spec-consuming skill
receives the spec cluster itself rather than a paraphrase of it.

## Exact transitions

### Spec design loop

1. Start `task-groundwork` with the roadmap path and task number.
2. Pass its complete output to `to-spec`.
3. Give the resulting spec cluster path to `adversarial-spec-review`.
4. On failure, return the spec and complete review findings to the design
   session. Use `revise-spec-from-review`, then rerun
   `adversarial-spec-review`.
5. On pass, run `spec-readiness` with the spec cluster path.
6. On readiness failure, return the spec and readiness findings to the design
   session. Use `revise-spec-from-review`, then rerun `spec-readiness`.
7. Only a passing spec review and passing readiness result permit handoff to
   implementation.

### Implementation and PR loop

1. Start a separate implementation session with the approved spec cluster
   path.
2. Use `senior-implementer` for the implementation.
3. Do not open the PR inside the implementation session.
4. Start a separate commit/PR session. Invoke `commit-work`, then `pr-branch`,
   without a separate task input; each reads the relevant Git state.
5. Start a review session and give the PR number to
   `adversarial-diff-review`.
6. On failure, return the complete findings to an implementation session,
   apply only bounded corrections, and rerun `adversarial-diff-review`.
7. A passing diff review returns the decision to the human. It does not merge
   automatically.

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

## Session handoff record

Each session should leave enough information for a different window, tool, or
model to continue without guessing:

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
5. Use `tune-skill` for a concrete, reproducible behavior complaint.
6. Add a new skill only when the responsibility is genuinely distinct; prefer
   improving or connecting small existing skills.
7. Require human review before changing the repository source of truth.

`revise-spec-from-review` is an example of this evolution: it was introduced
because review findings were not being converted into reliable spec revisions.
It is still an early-use skill and should be evaluated from real sessions
rather than assumed complete.

## Boundaries

- This workflow is not tied to one model, provider, editor, or agent surface.
- It does not schedule or monitor sessions automatically.
- It does not automatically edit skills from a single observation.
- It does not replace independent review with self-review.
- It does not turn `ready`, `pass`, or `review-required` into commit, push,
  install, merge, or deployment permission.
- Changes to this workflow should reflect repeated evidence or an explicit
  human decision, not tool fashion.
