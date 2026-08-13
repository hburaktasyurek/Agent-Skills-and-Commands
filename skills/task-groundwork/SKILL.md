---
name: task-groundwork
description: "Use only when the user explicitly names task-groundwork to ground a vague or non-trivial software task before specification or implementation. Investigate the current repository, relevant roadmap context, history, and real-use constraints; resolve technical branches with evidence, expose only genuine human decisions, and return a concise decision-ready brief. Do not use for a narrow task that is already ready for direct execution."
---

# Task Groundwork

Turn an underspecified task into decision-ready context. The value is the
decision-changing evidence and resolved scope, not a filled methodology form.

Read `references/outcome-lock.md` and **produce** its four lanes. Do not copy that
essay into the brief.

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

Derive the task purpose instead of repeating its title. Produce an **Outcome
lock** in prose that states the four lanes: owned outcome, substrate-call,
sibling-fence, and accepted residual. Quote the binding outcome, owned
observables, the landed owner this child will call, sibling owners this child
will not swallow, and residuals this child will not close. It preserves task
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

If viable routes differ in public behavior, state/recovery owner, a safety
invariant without an owner, or pull sibling work forward, stop blocked and ask
exactly one Open K2 question whose options are only `call-substrate` /
`own-in-child` / `defer-new-child` / `stop`. Do not offer a free-form menu.
Repository defects, security findings, credible edge cases, and proof gaps are
evidence to classify; they never enlarge the outcome lock by themselves.

Eliminate impossible, unsafe, or out-of-scope routes with evidence. Use
repository precedent and constraints for technical choices, keep current,
future, and deferred work separate, and do not manufacture a decision from
hypothetical external state. A bounded expiry consequence does not pull
migration, dual-read, or rollout machinery into scope unless evidence makes it
necessary. An unowned correctness, security, compatibility, money, or
production invariant does not enlarge the outcome lock; it is a K2 question.

A landed neighbor is a substrate to call or a sibling to fence, not a hazard
to complete. Missing local interface is not a ban on the call.

Never defer a material decision, change task scope, or pull future work forward
without explicit approval. Default to read-only investigation and safe
non-mutating checks; ask before any repository write.

Do not write `Open K2: none` when recovery or state owner would change across
the remaining routes.

## Return the grounding brief

Return the smallest brief that makes the next stage safe. For every
positive-fit brief, use all four exact headings below; none is omittable. Use
`none` where a heading has no remaining content. The narrow negative-fit
result remains the exception.

- **Outcome lock:** the four lanes — owned outcome, substrate-call (named
  landed owner and entry), sibling-fence (named owners this child will not
  swallow), accepted residual.
- **Non-goals and sibling fence:** excluded behavior and its owner. Not a
  list of landed hazards.
- **Viable minimal paths:** evidence-backed routes, eliminations, and the
  least-widening safe route that calls landed owners rather than owning a
  parallel machine.
- **Open K2:** each remaining human decision as the typed enum; write
  `Open K2: none` only when ready and no recovery/state owner still moves.

When asking, emit the four options with the concrete binding for this
scenario. Do not replace them with a product-outcome menu.

Also include decision-relevant current-system evidence, assumptions and
`⚠️ UNVERIFIED` caveats, why investigation stopped, and whether the task is
ready for specification or direct execution. Cite files and lines for
file-backed facts. A ready handoff has `Open K2: none`; otherwise report
blocked/not ready with the single enum question and do not invoke the next
skill.

Return the completed brief directly. Do not leave a research plan, approval
wrapper, or instructions for a later response in place of the brief.

Do not write a briefing file. Stop as obsolete or misframed when the artifacts
prove the requested task should not proceed.
