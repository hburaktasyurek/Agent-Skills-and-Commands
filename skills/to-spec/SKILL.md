---
name: to-spec
description: "Apply Work Breakdown Structure to turn sufficiently resolved conversation and task context for one bounded software change into an evidence-backed, contradiction-audited, production-ready four-file specification whenever the user invokes `to-spec` or `/to-spec`, says `write the spec`, `create a spec folder`, `spec it out`, or a variation of `turn this into a spec`, or finishes a design discussion with `let's write this up` or `I'm ready to hand this off` for the implementation agent first; the human owner and independent spec reviewer second; and agents grounding later dependent tasks third. Follow the embedded method, validation, and human-stop rules."
---

# to-spec

## Objective

Apply Work Breakdown Structure (`work-breakdown-structure`) to this job: turn sufficiently resolved conversation and task context for one bounded software change into an evidence-backed, contradiction-audited, production-ready four-file specification whenever the user invokes `to-spec` or `/to-spec`, says `write the spec`, `create a spec folder`, `spec it out`, or a variation of `turn this into a spec`, or finishes a design discussion with `let's write this up` or `I'm ready to hand this off`

Produce the result for the implementation agent first; the human owner and independent spec reviewer second; and agents grounding later dependent tasks third.

## Operating instructions

Use the complete conversation and authoritative task artifacts to define one bounded change. Before drafting, stop on unanswered questions, unapproved deferred decisions, explicit TBD markers, contradictions, or ambiguity that could change product behavior, scope, interfaces, architecture, acceptance, or output location. Inspect the relevant production code, tests, schemas, configuration, history, local standards, and repository inventory before stating current facts. Cite file-backed claims with verified paths and exact supporting line ranges; identify conversation-backed decisions by speaker and distinctive message text without inventing file citations. Prefer code when documentation conflicts, label only non-material implementation inferences with their repository basis, and mark non-decision evidence gaps as ⚠️ UNVERIFIED everywhere they matter. Use `agent-os/specs` by default with a `YYYY-MM-DD-HHMM-kebab-case` slug; ask only when the slug is genuinely ambiguous or a different root is requested. Draft all four files before saving, write directives rather than unresolved options, keep one independent task per folder, and stop after reporting the saved spec.

## Required deliverable

Create exactly one folder at `agent-os/specs/YYYY-MM-DD-HHMM-<slug>/` containing exactly `shape.md`, `plan.md`, `references.md`, and `standards.md`. `shape.md` defines What this builds, verified Key interfaces, Data flow, sourced or labeled-inference Design decisions, and product-focused Out of scope. `plan.md` contains concrete testable Acceptance criteria mapped to named sections in `shape.md` and `standards.md`; ordered independently reviewable Implementation tasks that each name owner, files and changes, validation, dependencies, and outcome; Dependencies; and Known risks. `references.md` records every examined source with purpose, relevance, exact line-addressed facts, conversation decisions, inventory observations, discrepancies, validation evidence limits, resolved-link audit, and Unverified claims with an exact count. `standards.md` records source-backed Naming conventions, Structural patterns, Anti-patterns, Test conventions, and any acceptance-critical assertion semantics that were actually verified. The four-file cluster collectively serves all audiences. After saving, return the folder path, one-line summaries of all four files, and the exact unverified-claim count.

## When to use

- Use when: The required four-file specification and ordered implementation work packages must be decomposed into independently reviewable deliverables.
- Do not use when: The requested outcome is not this multi-deliverable specification cluster or cannot be decomposed without fabricating work.
- Why Work Breakdown Structure: For this skill, the Work Breakdown Structure subject is the mandatory four-file specification and its implementation work packages, not the size of the underlying software change. A small bounded code change remains authorized because the cluster still has four non-overlapping responsibilities. Stop subdividing once each artifact or package is bounded, reviewable, validated, and ordered.

## Workflow

Apply this Work Breakdown Structure procedure while executing the job:

## Definition

Decompose a large deliverable into smaller work packages that can be owned,
ordered, and validated independently.

## Fit

- Best when a large body of work cannot be implemented or reviewed safely as
  one unit.
- Avoid when the task is already small enough for one bounded run.

## Principles

- Decompose by deliverable, not by vague activity.
- Keep every work package independently reviewable.
- Separate outcomes from the actions used to produce them.
- Give each package validation and dependency information.

## Steps

1. Name the final deliverable.
2. Split it into major deliverables with non-overlapping responsibilities.
3. Split each major deliverable into bounded work packages.
4. Add ownership, validation, and dependency notes to each package.
5. Identify which work package should run first.

## Quality questions

- Are the parts deliverables rather than vague activities?
- Can every package be reviewed independently?
- Does every package have observable validation?
- Are dependencies and the first integration slice visible?

## Stop

Stop when every package is bounded, reviewable, validated, and ordered. Do not
keep decomposing work already small enough to execute. Stop and ask for human
help if the task does not fit Work Breakdown Structure, required context is
missing, or validation cannot be satisfied without guessing.

## Execution checks

- Reject insufficient, unresolved, contradictory, or multi-task context before drafting; return every material product, scope, interface, architecture, acceptance, or output-location decision to the human instead of guessing.
- Inspect the relevant repository evidence; trace material current-state claims to exact supporting file ranges, trace conversation decisions without fabricated file citations, support broad negative claims with an adequate inventory, and label non-material inference.
- Make every acceptance criterion observable and map it to named `shape.md` and `standards.md` sections. Validation must directly prove the full criterion and preserve its quantifiers; representative examples do not prove `every`, `only`, or `exactly`. A green suite, scoped diff, or assertion proves only what it observes. For additive test work, inspect the test diff to preserve relevant baseline cases as well as add the required cases. For file or dependency prohibitions, inspect tracked and task-relevant untracked or ignored paths. Inspect local assertion behavior when exact type, value, message, state, or side-effect semantics are acceptance-critical; an exact error type needs a runtime-appropriate type-identity check against a counterexample that preserves other observables while changing only the type identity. Do not invent brittle shell or byte-level gates the task does not require.
- Use Work Breakdown Structure to split the software change into ordered work packages that each name owner, files and changes, validation, dependencies, and independently reviewable outcome; identify the first integration slice.
- Draft all four files before saving and audit atomic claims for interface, scope, standards, evidence, source entailment, inference, acceptance mapping, links, validation sufficiency, and out-of-scope consistency; resolve every contradiction.
- Verify every emitted relative path and Markdown heading fragment against the saved cluster; cite source lines as plain path-and-range text unless real line anchors are known to exist.
- Produce exactly one timestamped folder and exactly the four required files; ensure the cluster is usable without conversation history by all three audiences.
- Stop after saving and reporting; do not implement, independently review, commit, push, merge, install, or change workflow documentation.

## Evidence to return

- List the controlling request and every repository or conversation source used, with purpose, relevance, exact supporting locations, discrepancies, labeled inferences, and inventory-backed negative claims.
- State what each acceptance validation actually proves and record any acceptance-critical assertion behavior inspected; do not claim execution of future implementation.
- Surface the acceptance mapping, ordered work packages, owners, dependencies, first integration slice, and product scope boundaries.
- Report the completed contradiction, interface, scope, standards, evidence, inference, link, and validation audits plus every remaining ⚠️ UNVERIFIED claim.
- Return the exact folder path, one-line summaries of all four files, the exact unverified-claim count, and evidence that no implementation was performed.

## Human review and stop

- Stop before drafting when context is insufficient, internally contradictory, unresolved, or no longer one bounded software change.
- Return unresolved material decisions to the human; only non-decision evidence gaps may remain, marked ⚠️ UNVERIFIED everywhere they affect the spec.
- Stop for human direction when the requested root differs from `agent-os/specs`, the slug is genuinely ambiguous, repository evidence conflicts with the task, or a required acceptance condition cannot be validated without guessing.
- Stop when any contradiction, unsupported material claim, fabricated citation, unlabeled material inference, broken link, unmapped acceptance criterion, unordered or unowned work package, insufficient validation, or hidden unverified claim remains.
- Stop immediately after saving and reporting the four-file cluster; return independent review, implementation, workflow integration, commit, push, installation, and merge to their owners.

Human approval is required before: using a spec root other than `agent-os/specs` or choosing a genuinely ambiguous slug, deferring a material product or architectural decision, changing task scope or accepting an alternative validation approach for a required acceptance condition, starting independent review or implementation, changing workflow documentation, committing, pushing, merging, or installing any skill globally.

## Boundaries

- Apply only Work Breakdown Structure; do not blend another methodology.
- Do not change the task contract to make validation easier.
- Do not perform an approval action without the required human decision.
- Stop when the task no longer matches the recorded method fit.
