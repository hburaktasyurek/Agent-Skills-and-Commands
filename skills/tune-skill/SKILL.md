---
name: tune-skill
description: >-
  Improve one existing skill from concrete user feedback, a failed run, or
  another observed behavior complaint using a bounded PDCA cycle. Use when an
  existing skill behaves incorrectly or its instructions, methodology,
  original contract, package boundary, runtime copy, or tuning scope may be
  responsible. Applies a direct change only when the correction belongs inside
  one skill package; otherwise routes the work to its owning workflow.
---

# PDCA: tune-skill

## Assignment contract

Methodology: PDCA (`pdca`)

Task: Improve one existing agent skill against a concrete observed behavior complaint by making the smallest evidence-backed change inside that skill package, while routing methodology, original task-contract, multi-skill, and self-tuning problems to their owning workflow instead of patching them.

Audience: Agents maintaining skills in this repository and humans reviewing proposed skill changes.

Context: Authority: Resolve and obey repository instructions, then locate the maintained source copy. Installed and runtime copies are evidence only and remain read-only during this skill; global copies are always read-only. Any later installation or synchronization is a separate human-owned task outside tune-skill. Preserve unrelated working-tree changes. Never commit, push, install, or modify global copies.

PDCA operating frame:

Plan: Read the target SKILL.md end to end, its behavior-relevant linked resources, the failed output or conversation, and any available source/runtime difference. Lock one complaint contract containing the behavior class, evidence, expected behavior, and preservation boundary. Obtain facts from artifacts rather than the user. If a material product or scope decision remains ambiguous, run a bounded Interview of at most three questions: ask one question at a time, state the artifact facts that leave the decision open, include the recommended answer, and make no change until shared understanding is explicit. An Interview turn also uses the four-line output: `Result: blocked`; `Change` names the unresolved decision and confirms no edit; `Evidence` gives the relevant artifact facts plus the recommendation; `Next` contains exactly one question for the human. If a controlling ambiguity remains after three questions, stay blocked and name it; do not guess or continue interviewing. Before classification, return `blocked` when available evidence cannot determine which class owns the complaint; missing direct-edit approval does not prevent classification but always prevents Do. Otherwise use the first matching class in this precedence: (1) self-tuning always returns to methodology-selector and methodology-skill-creator from a separate design/creation session that is not recursively running the current tune-skill; (2) external-cause when tools, permissions, or stale runtime copies fully explain the reported behavior; (3) return-to-methodology when a methodology-generated skill selected the wrong method; (4) return-to-contract when its selected method is valid but its original eight fields are wrong; (5) return-to-loop for multi-skill, shared-contract, architectural, outside-package, broad redesign, or any correction whose responsibility is not one direct tune; (6) direct-tune only when the remaining cause and complete correction stay inside one target package; otherwise `blocked`. A specific earlier class is not reclassified merely because its resolution occurs outside the target package. Use exact owners: return-to-methodology goes to methodology-selector and then methodology-skill-creator; return-to-contract rebuilds the eight-field methodology-selector contract and then returns to methodology-skill-creator; return-to-loop goes to loop-orchestrator with a new loop-goal intent; external-cause goes to the human or tool/runtime owner named by the evidence; blocked goes to the human who owns the missing evidence or authority. For direct-tune, trace the failed output back to the instruction, omission, conflict, or workflow order that allowed it. Plan the smallest behavioral change that fixes the complaint and one adjacent case without disturbing preserved behavior. Present the complaint, evidence-backed diagnosis, exact target-package files, proposed behavioral change, preserved behavior, and validation plan. The approval proposal itself must use the four-line output: `Result: blocked`; `Change` names the exact files, proposed behavior, and preserved behavior; `Evidence` compresses the complaint, diagnosis, and validation plan; `Next` asks the human to approve or correct that exact scope. Wait for human approval unless that same proposal was already approved after being shown.

Do: After approval, edit only the causally required files inside the one target skill package, including its SKILL.md, references, evals, or scripts when necessary for one coherent correction. If new evidence makes another package, shared contract, methodology, or original contract relevant, stop before widening the edit, return to Plan, and reclassify under the same precedence using the current evidence. Do not automatically revert, reset, or discard changes already made. When reclassification occurs after an edit, return `Result: blocked`; list the exact partial files and state in `Change`, give the reclassification evidence in `Evidence`, and name the human plus owning workflow that must decide whether to preserve or revert them in `Next`. Do not mix unrelated cleanup into the change.

Check: Inspect the complete target-package diff and run available structural validators. All behavioral validation is non-mutating by default: use read-only artifacts or an isolated harness, and do not let a tester edit the shared repository or runtime, synchronize installed/global copies, contact external systems, or perform another consequential action. If valid proof requires mutation, stop for separate authority; inability to obtain safe proof prevents completion. Reproduce the original failure or the smallest evidence-equivalent case, run one adjacent case that would expose example-specific overfitting, and obtain a non-mutating independent cold-read against the complaint and prior version or diff. A Markdown check is not behavioral evidence. If a check cannot run or fails, do not claim completion; return to Plan with a new proposal, route, or block.

Act: Keep the change only when all three behavioral checks support the complaint contract and scope stayed fixed. Otherwise adjust through a newly approved plan, route to the owning workflow, or stop. End the invocation after that check-and-act decision.

Required output: Return exactly four concise lines and no default detail: Result: changed | routed | blocked; Change: the behavior changed or the reason for routing/blocking; Evidence: the original/equivalent case, adjacent case, and cold-read outcome, or the evidence supporting the route/block; Next: the exact next skill, human owner, or none. Supply diagnostic or diff detail only when requested.

## Method fit

- Best when: A workflow should improve through repeated measured cycles.
- Avoid when: The task is a one-off decision with no next cycle.
- Selection evidence: Skill tuning repeats across real usage: plan one bounded behavioral change, apply it once, compare evidence with the complaint, then keep, adjust, route, or stop without silently widening scope.

## Canonical method

Source: [canonical PDCA reference](../methodology-selector/references/pdca.md)

## Definition

Improve a process by planning a change, running it on a small scale, checking
the evidence, and acting on what was learned.

## Fit

- Best when a workflow should improve through repeated measured cycles.
- Avoid when the task is a one-off decision with no next cycle.

## Principles

- Keep the planned change small enough to test.
- Run it within a fixed boundary.
- Compare the result with the expectation.
- Standardize, adjust, or stop before the next cycle.

## Steps

1. Plan the smallest useful change.
2. Do one bounded run.
3. Check the evidence against the hypothesis.
4. Act by keeping, changing, or stopping the loop.

## Quality questions

- Was the change small enough to evaluate?
- Was the result measured?
- Is the next action based on evidence?
- Did scope remain fixed during the run?

## Stop

Stop after the check-and-act decision. Do not manufacture a next cycle for a
one-off task. Stop and ask for human help if the task does not fit PDCA,
required context is missing, or validation cannot be satisfied without
guessing.

## Validation

- The complaint is locked at the user's stated abstraction and traced to current artifact evidence before a change is proposed.
- A bounded Interview asks one decision question at a time, includes a recommended answer, and runs only when material ambiguity remains after repository investigation.
- The run classifies the work as direct-tune, return-to-methodology, return-to-contract, return-to-loop, external-cause, or blocked and names the owning next workflow.
- No target source is edited before the human approves the exact diagnosis, files, behavioral change, and preservation boundary.
- A direct tune changes only causally required files inside one target skill package and leaves installed or global copies untouched.
- A methodology-generated skill keeps its selected methodology and eight-field contract; incompatible corrections are routed upstream.
- The original or evidence-equivalent failure, one adjacent case, and a non-mutating independent cold-read all support completion; a missing or failed check prevents a completed result.
- The final response contains only Result, Change, Evidence, and Next unless the user requests details.

Evidence to surface:

- The complaint contract and the artifact evidence used to diagnose it.
- The approved file scope and final diff for the target skill package.
- Observed results for the original or evidence-equivalent case, adjacent case, and independent cold-read.
- The final four-line Result, Change, Evidence, and Next report.

## Human review and stop

- The complaint, expected behavior, or preservation boundary remains ambiguous after the bounded Interview.
- The evidence points to a wrong methodology or original eight-field contract.
- The correction requires another skill package, shared contract, architectural redesign, or tune-skill modifying itself.
- The approved file scope would be exceeded.
- The original failure, adjacent case, or independent cold-read cannot be run or does not support completion.

Human approval is required before: editing the target skill package after reviewing the exact diagnosis and proposed change.

## Boundaries

- Apply only PDCA; do not blend another methodology.
- Do not change the task contract to make validation easier.
- Do not perform an approval action without the required human decision.
- Stop when the task no longer matches the recorded method fit.
