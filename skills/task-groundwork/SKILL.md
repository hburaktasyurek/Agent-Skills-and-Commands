---
name: task-groundwork
description: "Use only when the user explicitly names task-groundwork to ground a vague or non-trivial software task before specification or implementation. Investigate the current repository, relevant roadmap context, history, and real-use constraints; resolve technical branches with evidence, expose only genuine human decisions, and return a concise decision-ready brief. Do not use for a narrow task that is already ready for direct execution."
---

# Task Groundwork

Turn an underspecified task into decision-ready context. The value is the
decision-changing evidence and resolved scope, not a filled methodology form.

## Establish fit and authority

Use the supplied task source as authority. A direct request is sufficient; do
not require a roadmap, ticket, predecessor, or spec unless the request makes it
controlling.

If the task is already narrow and its implementation boundary is clear, stop
with a short negative-fit result: say why groundwork adds no decision value,
state the bounded execution scope, and name the necessary verification guard.
The guard should include a reference search plus diff, value, and behavior
checks where those apply. Do not produce a generic 5W2H inventory.

## Investigate what can change the decision

Read applicable repository instructions first. Then inspect only evidence that
can change the task's meaning, feasible routes, scope, acceptance, or risk:

- the task and its enclosing phase or product goal;
- relevant implementation, tests, configuration, schema, and contracts;
- prior work that establishes the current state;
- future tasks or consumers that define the boundary;
- real-use, compatibility, safety, and operational constraints.

Match claims to evidence and cite files and lines where available. Separate
verified fact from inference. Do not turn the investigation into an exhaustive
system inventory; stop when more evidence would not change the decision.

## Resolve the task tree

Derive the task purpose instead of repeating its title. Identify the material
branches between the current state and a spec or implementation:

1. Eliminate impossible, unsafe, or out-of-scope routes with evidence.
2. Resolve technical choices from repository precedent and constraints.
3. Keep current, future, and explicitly deferred work separate.
4. Ask the user only when a material product, priority, or authority decision
   remains after the repository search. Include the search trail with the
   question; do not ask the user to rediscover repository facts.

Do not manufacture a decision from hypothetical external state. If the
artifacts show that superseded state expires within a bounded interval, record
that consequence and keep migration, dual-read, or rollout machinery out of
scope unless repository evidence makes compatibility work necessary.

Use qualitative engineering judgment. A load-bearing correctness, security,
compatibility, money, or production invariant can outweigh convenience. Do not
invent numeric scores.

Never defer a material decision, change task scope, or pull future work forward
without explicit approval. Default to read-only investigation and safe
non-mutating checks; ask before any repository write.

## Return the grounding brief

Return the smallest brief that makes the next stage safe. It must make clear:

- the task's derived purpose and controlling source;
- decision-relevant current-system evidence;
- in-scope and out-of-scope boundaries, including future ownership;
- viable routes, evidence-backed eliminations, and the chosen route;
- assumptions, caveats, and unresolved human decisions;
- whether the task is ready for specification or direct execution.

Use only headings that improve comprehension and omit empty sections. State why
investigation stopped. Do not write a briefing file or invoke the next skill.

Stop as blocked when evidence is contradictory or unavailable and guessing
would decide product behavior, authority, safety, or scope. Stop as obsolete or
misframed when the artifacts prove the requested task should not proceed.
