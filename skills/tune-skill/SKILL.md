---
name: tune-skill
description: >-
  Improve an existing skill against concrete user feedback, a failed run, or a repeated behavioral complaint.
  Use when a skill keeps doing the wrong thing, misses an instruction, narrows or overgeneralizes feedback,
  behaves inconsistently, or needs a focused update based on observed use. Locks the complaint's real scope,
  traces evidence to the instruction-level cause, proposes the smallest effective change for confirmation,
  edits the source copy, and validates the result with diff-aware review and fresh-context testing when available.
  Not for creating a new skill, complaint-free auditing, or an unscoped rewrite.
---

# Tune Skill

Tune an existing skill without destabilizing what already works. The goal is not the fewest changed words; it is the narrowest change that fixes the behavioral generator, survives an adjacent case, and introduces no new ambiguity.

## 1. Lock the complaint

Separate the user's feedback into three parts before diagnosing:

- **Behavior class:** what should change across runs.
- **Evidence:** examples, outputs, or failed runs showing the behavior.
- **Boundaries:** explicit corrections about what the solution must not narrow to or expand into.

Treat statements such as “that is only an example,” “not just this error,” or “the problem is general” as binding scope constraints. Never promote the most vivid example into the diagnosis when the user named a broader behavior.

Write a one-sentence **complaint contract** at the user's abstraction level. Test it against a second plausible instance of the same behavior. If it describes only the named example, it is too narrow; if it would justify unrelated cleanup, it is too broad.

If material uncertainty remains, ask at most three diagnostic questions total, starting with the answer that most controls scope. Proceed only when the remaining uncertainty would not change the scope, operation, or expected behavior of the edit. If a controlling uncertainty remains after the cap, state it and wait; do not force an edit from an unstable complaint contract.

## 2. Resolve the target and evidence

Find the authoritative editable skill source from the current repository, project instructions, and install documentation; prefer a git-tracked source when one exists. Do not assume a fixed runtime directory or that exactly two copies exist. A handed runtime path is evidence about what executed, not automatic permission to edit it. If only an installed or untracked copy is visible and its source of truth is unknown, stop and ask where the maintained source lives.

Before proposing a change:

1. Read the authoritative `SKILL.md` end to end.
2. Read directly linked resources required to understand the complained-about behavior.
3. If a runtime or installed copy produced the failure, compare it with the source copy. Surface divergence and identify which copy explains the run.
4. Inspect the failed output, trace, or conversation when available. Use focused git history only when intent or regression timing matters.
5. Read and obey repository instructions before writing anywhere.

Conversation evidence establishes how the skill failed; the skill and its resources establish why. Do not patch the skill when the evidence instead points to a tool limitation, permission boundary, stale runtime copy, or another external cause.

## 3. Diagnose the behavioral generator

Trace backward from the bad behavior: output → decision the agent made → instruction, omission, conflict, or workflow order that made that decision reasonable. State the root cause in this form:

> Because [instruction or absence] makes or allows [decision], the skill produces [complained-about behavior] under [conditions].

Common generators include:

- a missing exit condition when the skill never converges;
- a present but weak rule that loses under pressure;
- two distinct rules blended into one instruction;
- a frontmatter promise the body does not implement;
- a workflow phase that occurs too late to constrain an earlier decision;
- a runtime/source mismatch that makes a correct repo edit appear ineffective.

Run a falsification test before choosing a fix:

- **Location:** would editing the visible symptom leave the upstream cause intact?
- **Shape:** would the same failure return under another error, artifact, or scenario the user did not enumerate?
- **Counterfactual:** would the proposed change alter the original decision path and the adjacent test case without disturbing unrelated behavior?

If any answer is unfavorable, keep tracing. Do not turn one reported example into a list of special cases when the cause is a default posture, ordering rule, or missing decision boundary.

## 4. Choose the operation

Prefer one operation and explain why it beats the alternatives:

- **Add:** required behavior is genuinely absent and no existing instruction can cleanly carry it.
- **Refine:** the right behavior exists but is weak, narrow, ambiguous, or placed at the wrong abstraction level.
- **Remove:** text is vestigial, contradicted, redundant, or actively produces the failure.
- **Split:** one instruction performs two jobs and lets the reader choose the wrong interpretation.
- **Move:** the right rule exists but runs too early, too late, or in the wrong phase to govern the decision.

“Smallest” means least behavioral disturbance, not fewest lines. If the complaint proves that the skill needs a new architecture, broad rewrite, or evaluation program rather than a focused correction, stop and propose switching to the skill-creation workflow. Do not expand scope or switch workflows without explicit confirmation.

If a coherent fix genuinely requires more than one operation, disclose every operation and why the combination is indivisible. Never hide cleanup or a second behavioral change behind a “primary” operation.

## 5. Propose before editing

Before touching the file, present:

1. the complaint contract, including explicit boundaries;
2. the evidence-backed root cause;
3. every section and operation to change;
4. the expected behavior change and one adjacent case it should also handle;
5. what will remain deliberately untouched;
6. how the edit will be validated.

Keep the proposal concise, but do not omit the reasoning needed to expose a scope mistake. Wait for confirmation unless the user has already approved this exact scope after seeing the proposal. A generic request to “update the skill” is not approval for an unshown diagnosis.

## 6. Apply only the confirmed change

Edit only the confirmed authoritative source and stay within its repository or project write boundaries. Do not sync, overwrite, or delete installed/runtime copies unless the user separately asks and the environment authorizes it. If source and runtime copies diverge, preserve both and report the difference.

Touch only what the confirmed proposal covers. Preserve unrelated user changes in a dirty worktree. If editing exposes another issue:

- pause and re-propose when the issue—whether new or pre-existing—must be resolved for the confirmed fix to be coherent or safe;
- record it separately without editing when it is unrelated and non-blocking;
- never fold opportunistic cleanup into the approved edit.

## 7. Validate the behavior

Validation must prove the complaint contract, not merely show valid Markdown.

Behavioral validation is non-mutating by default. Use read-only artifacts, an isolated harness, or proposal-only stopping points; never let a tester edit the shared repository, sync runtime copies, contact external systems, or perform other consequential actions. If the behavior cannot be proved without mutation, request separate authority or report the unverified portion instead of broadening validation scope.

1. Inspect the final diff for scope and run any available skill validator.
2. Re-run the original failure path in that non-mutating boundary. If the exact artifact is unavailable, reconstruct the smallest evidence-equivalent case from the complaint without inventing missing facts. Do not claim the original behavior is resolved unless the original or evidence-equivalent case demonstrates the changed decision path; otherwise report the validation gap and keep the tune incomplete.
3. Test the adjacent case from the proposal. For every applied edit, use fresh-context subagents when available to test the original or evidence-equivalent case and the adjacent case. Give them the skill plus realistic user requests—not the diagnosis, intended fix, or expected answer. Use independent runs when one test could leak the other case's lesson.
4. Use a separate fresh context to cold-read the post-edit skill against the complaint contract and the pre-edit version or diff. Never reuse a behavioral tester as the cold reader.

Use this cold-read brief, adapted to the available agent interface:

> Given the complaint contract and the pre-edit version or diff, read the post-edit skill end to end. Findings only; do not propose fixes. Label each finding `introduced` or `pre-existing`. Check for complaint-contract violations, contradictions, blended rules, frontmatter/body mismatch, vestigial text, and instructions that permit two reasonable behaviors. Report pre-existing issues only when they block the complaint contract or make the new edit unsafe. Stay under 200 words.

An `introduced` finding, a complaint-contract violation, or a pre-existing finding that makes the edit unsafe or incoherent returns the workflow to diagnosis and requires a new proposal before further editing. Do not expand the tune to search for non-blocking pre-existing issues; if other evidence independently exposes one, report it separately without editing it. If independent fresh contexts are unavailable, perform the missing checks directly as lower-confidence evidence, disclose `independent validation unavailable`, and never describe that fallback as fresh-context or independent validation.

## 8. Finish with evidence

Before reporting completion, verify each item:

- the final behavior matches the complaint contract at the requested abstraction level;
- the original or evidence-equivalent case and the adjacent case both demonstrate the intended decision change;
- no explicit boundary or unrelated behavior was absorbed into the fix;
- validation and cold-read results support the claim;
- repo and runtime state are accurately reported.

Report the changed source file, the behavioral effect, validation performed, any relevant pre-existing finding, and whether runtime copies were intentionally left untouched.

Save a cross-skill feedback principle only when it is genuinely new, the user explicitly asks to retain it, and the environment provides an authorized memory mechanism. Memory work must never broaden or block the tune itself.

## What this skill is not

- Not for creating a new skill from scratch—stop, propose the skill-creation workflow, and wait for confirmation.
- Not for a complaint-free general audit—stop, propose a review workflow, and wait for confirmation.
- Not for silently turning a focused complaint into a major rewrite.
- Not for editing runtime copies or unrelated files without explicit authority.
