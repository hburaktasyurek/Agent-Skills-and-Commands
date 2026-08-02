---
name: skill-eval
description: "Use only when explicitly asked to evaluate one repository skill package against its exact old-skill or no-skill baseline. Run the same realistic cases on one named harness and model, judge produced artifacts, and return a current-package PASS, FAIL, NO_LIFT, or INCONCLUSIVE verdict. Do not edit or accept the target package or exercise live consequential systems."
disable-model-invocation: true
---

# Skill Eval

Evaluate whether one skill improves the produced work. Do not award credit for
headings, claimed procedure, or a report that merely looks complete.

## Input

Require:

- exactly one `target: <INDEX name>` or `subject_path: <path>`;
- `phase: calibrate | verify`;
- one `surface` with `adapter: codex | claude-code | cursor | opencode | cline`
  and an exact model name;
- `evals/evals.json` and a resolvable old-skill or no-skill baseline.

Hash the complete subject package with `scripts/hash-skill-package.mjs`. Every
terminal result belongs only to that hash. If the package changes, re-run the
evaluation.

## Safety

Keep the subject read-only. Run file-changing tasks only in disposable copies
below `.skill-eval-runs/`. Mock consequential boundaries such as
push, PR/issue creation, payments, migrations, or production services. If a
safe fixture is unavailable, return `INCONCLUSIVE`.

Do not edit the subject, commit, push, install globally, or contact live
external systems.

## Run

Read [references/run-protocol.md](references/run-protocol.md), then:

1. Validate the eval definition.
2. For every case, create separate baseline and subject workspaces.
3. Run both with the same prompt, fixture, adapter, model, permissions, and
   limits. Start each in a clean session.
4. Use `scripts/run-harness-eval.mjs --adapter <id> ...`. The adapter only
   translates the common run into a harness command and parses its output.
5. Judge mechanical assertions with deterministic checks. Judge semantic
   quality by a blind comparison of the two produced artifacts. Store a short
   evidence file for every assertion and grade.
6. In verify phase, build the result described in
   [references/evidence-contract.md](references/evidence-contract.md) and run
   `scripts/compute-eval-verdict.mjs` against the current subject path.

Never compare token counts between different adapters or models. Missing token
telemetry is `unavailable`, not guessed and not automatically inconclusive;
artifact quality can still prove lift. Duration is reported but does not prove
lift by itself.

### Calibration

Run the pairs and propose assertions, but do not issue a terminal verdict.
Reject assertions that also pass on a clearly wrong artifact. A human or a
separate reviewer approves the assertion set before it is added to the draft.

### Trigger check

The MVP derives the trigger requirement from the package: explicit-only skills
do not require an automatic-activation check; implicit skills do. Native
trigger-trace verification is not implemented yet, so an implicit skill cannot
receive terminal PASS from this MVP. Record it as `NOT_RUN` and return
`INCONCLUSIVE` instead of trusting a claimed trigger result. Cursor also uses
explicit prompt context rather than native skill loading.

## Verdict

- `PASS`: all assertions pass, no artifact regresses, required trigger checks
  pass, and at least one artifact grade or observed token comparison is better
  than baseline.
- `FAIL`: an assertion, scope boundary, trigger check, or artifact grade fails
  or regresses.
- `NO_LIFT`: both configurations pass but the subject adds no measured value.
- `INCONCLUSIVE`: baseline, current hash, safe execution, required trigger, run
  trace, assertion evidence, or grade evidence is missing or inconsistent.

`FAIL`, `NO_LIFT`, and `INCONCLUSIVE` do not justify accepting or
committing the revision.

## Stop

Return one calibration artifact or one terminal verdict and stop. Evaluation
does not authorize fixing, committing, or accepting the result on the human's
behalf.
