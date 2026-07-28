---
name: task-groundwork-with-methodology
description: "Apply 5W2H to ground a non-trivial software task into a complete, evidence-backed decision context before specification or implementation for agents and humans deciding how to change complex software systems. Use when this bounded task matches the recorded method fit; preserve validation and human-review conditions."
---

# 5W2H: task-groundwork-with-methodology

## Assignment contract

Methodology: 5W2H (`five-w-two-h`)

Task: ground a non-trivial software task into a complete, evidence-backed decision context before specification or implementation

Audience: agents and humans deciding how to change complex software systems

Context: Input may be any authoritative task description or a direct user request; no particular planning artifact is required. Investigate the current system, relevant history, available plans, and real-use constraints only where they can change task meaning, feasible routes, scope, or acceptance. Match each claim to the source type that can establish it, distinguish fact from inference, and trace transitive effects until more evidence would no longer change the decision. Evaluate implementation routes qualitatively: do not use numeric or aggregate scores, and allow a load-bearing safety, correctness, compatibility, or real-use invariant to outweigh an option's other advantages. Default to read-only inspection and safe non-mutating execution; ask before any write. Other helpers or supplied skill outputs may contribute evidence, but the selected methodology remains the sole method and consequential next actions remain human-owned.

Required output: Return a concise grounding brief that states the task purpose, decision-relevant system frame, scope, resolved decision tree, chosen route with evidence and caveats, unresolved human decisions or approved deferrals, and readiness for the next stage. Use only headings that improve comprehension; omit empty or process-provenance sections.

## Method fit

- Best when: A vague task needs a complete operating frame.
- Avoid when: The question is already narrow and only needs execution.
- Selection evidence: A non-trivial change in a complex software system cannot be grounded safely until the relevant purpose, actors, locations, timing, behavior, effort or risk, failure modes, and real success conditions are complete. The requested artifact is explicitly that operating frame plus an evidence-backed route recommendation; scoring, work-package decomposition, execution, and summary writing are not the dominant need.

## Canonical method

Source: [Loop Engineering Methodology Skill Generator](https://loopengineering.app/methodology-skill-generator/)

## Definition

Frame a problem by answering what, why, who, where, when, how, and how much.

## Fit

- Best when a vague task needs a complete operating frame.
- Avoid when the question is already narrow and only needs execution.

## Principles

- Cover the whole situation before choosing a fix.
- Separate observed facts from assumptions.
- Make ownership and timing explicit.
- Surface cost or effort early.

## Steps

1. Define what is happening.
2. Explain why it matters.
3. Name who is involved.
4. Clarify where and when it occurs.
5. Describe how it should be handled.
6. Estimate how much time, cost, effort, or risk is involved.

## Quality questions

- Are all seven questions answered?
- Are assumptions marked?
- Is ownership clear?
- Is cost or effort visible?

## Stop

Stop when the operating frame is complete. Choose direct execution instead
when the task was already narrow. Stop and ask for human help if the task does
not fit 5W2H, required context is missing, or validation cannot be satisfied
without guessing.

## Validation

- The task is identified from the available authoritative description or direct request without requiring a particular planning format.
- The what, why, who, where, when, how, and how much frame covers every actor, flow, state, timing edge, capability, failure mode, effort or risk, and real success condition that could change the decision, but does not expand into an exhaustive system inventory.
- Material current-state claims have claim-matching evidence, inferences are labeled, and investigation stops only when more evidence would not change feasible routes, scope, acceptance, or the recommendation.
- Plausible implementation routes are surfaced, impossible or unsafe routes are eliminated with evidence, and the chosen route uses qualitative senior-engineering judgment rather than numeric or aggregate scoring.
- Scope, system effects, caveats, unresolved human decisions, and approved deferrals are explicit; no material branch or contradiction is silently hidden.
- The result is concise and actionable for the next stage, and it does not require a specific source artifact unless the current task itself makes that artifact authoritative.

Evidence to surface:

- Cite the task source and the code, tests, configuration, schemas, safe observations, history, plans, contracts, or product evidence actually used, with file and line references where available.
- Surface the decision-relevant operating frame and the reason further investigation stopped.
- For each material branch, record viable routes, evidence-backed eliminations, the chosen route, senior-engineering rationale, and caveats.

## Human review and stop

- Stop with negative-fit evidence when the task is already narrow and only needs direct specification or execution.
- Stop when decision-changing evidence is unavailable or contradictory, the operating frame cannot be completed without guessing, or a material product or real-use priority remains unresolved.
- Stop when the task is already complete, obsolete, materially misframed, or every plausible route remains unsafe.
- Keep the result blocked when a required write lacks explicit permission.

Human approval is required before: any repository write, deferring a material decision or changing task scope, choosing among product or real-use priorities that available evidence cannot resolve.

## Boundaries

- Apply only 5W2H; do not blend another methodology.
- Do not change the task contract to make validation easier.
- Do not perform an approval action without the required human decision.
- Stop when the task no longer matches the recorded method fit.
