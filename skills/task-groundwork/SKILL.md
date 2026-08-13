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

If the task is already narrow and its implementation boundary is clear, return
a short negative-fit brief instead of a generic 5W2H inventory. It still uses
the labels **Outcome lock**, **Non-goals and sibling fence**, **Viable minimal
paths**, and **Open K2: none**; say why groundwork adds no decision value,
state the bounded execution scope, and name the necessary verification guard.
The guard should include a reference search plus diff, value, and behavior
checks where those apply.

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

## Resolve the task tree and handoff authority

Derive the task purpose instead of repeating its title. First state an
**Outcome lock** in prose: quote the binding outcome, owned observables,
scope, non-goals, sibling owners, and accepted residuals. It preserves task
authority while leaving bounded local implementation choices to the next
stage; it is not a JSON schema or permission to invent a larger mechanism.

Classify every decision-relevant branch against that lock:

- **K0 — evidence question:** an authoritative source can resolve it.
- **K1 — bounded implementation freedom:** alternatives preserve every
  observable contract.
- **K2 — missing human decision:** product, scope, or architecture authority
  is absent and alternatives change observable behavior.

Resolve K0 before handoff. If unavailable evidence can change outcome, safety,
or scope, stop blocked; otherwise retain a `⚠️ UNVERIFIED` evidence limit for
the downstream author. Keep K1 visible as freedom rather than selecting it.
Return ready for `to-spec` only when no K2 remains.

If viable routes differ in public behavior, state/recovery behavior, a safety
invariant without an owner, or pull sibling work forward, stop blocked and ask
the one decision-changing K2 question. Repository defects, security findings,
credible edge cases, and proof gaps are evidence to classify; they never
enlarge the outcome lock by themselves.

Eliminate impossible, unsafe, or out-of-scope routes with evidence. Use
repository precedent and constraints for technical choices, keep current,
future, and deferred work separate, and do not manufacture a decision from
hypothetical external state. A bounded expiry consequence does not pull
migration, dual-read, or rollout machinery into scope unless evidence makes it
necessary. An unowned correctness, security, compatibility, money, or
production invariant does not enlarge the outcome lock; it is a K2 question.

Never defer a material decision, change task scope, or pull future work forward
without explicit approval. Default to read-only investigation and safe
non-mutating checks; ask before any repository write.

## Return the grounding brief

Return the smallest brief that makes the next stage safe. For every
positive-fit brief, use all four exact headings below; none is omittable. Use
`none` where a heading has no remaining content. The narrow negative-fit
result remains the exception.

- **Outcome lock:** binding outcome, owned observables, scope, non-goals,
  sibling owners, and accepted residuals this child will not close.
- **Non-goals and sibling fence:** excluded behavior, its owner, and any
  landed neighbor hazard this child will not close.
- **Viable minimal paths:** evidence-backed routes, eliminations, and the
  least-widening safe route.
- **Open K2:** each remaining human decision; write `Open K2: none` only when
  ready.

Also include decision-relevant current-system evidence, assumptions and
`⚠️ UNVERIFIED` caveats, why investigation stopped, and whether the task is
ready for specification or direct execution. Cite files and lines for
file-backed facts. A ready handoff has `Open K2: none`; otherwise report
blocked/not ready with the single decision-changing question and do not invoke
the next skill.

Return the completed brief directly. Do not leave a research plan, approval
wrapper, or instructions for a later response in place of the brief.

Do not write a briefing file. Stop as obsolete or misframed when the artifacts
prove the requested task should not proceed.
