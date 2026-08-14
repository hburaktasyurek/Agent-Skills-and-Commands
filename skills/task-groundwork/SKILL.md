---
name: task-groundwork
description: "Use only when the user explicitly names task-groundwork to ground a vague or non-trivial software task before specification or implementation. Investigate the current repository, relevant roadmap context, history, and real-use constraints; resolve technical branches with evidence, expose only genuine human decisions, and return a concise decision-ready brief. Do not use for a narrow task that is already ready for direct execution."
---

# Task Groundwork

Turn an underspecified task into decision-ready context. The value is the
decision-changing evidence and resolved scope, not a filled methodology form.

Read `references/outcome-lock.md` and **produce** its four boundary fields. Do
not copy that reference into the brief.

## Codex adapter mode

When the invocation includes `Adapter: codex-task-to-spec`, verify the named
packet manifest and artifact hashes before work. Treat only the named task and
authority artifacts as input; when `Authority resolutions:` is non-`none`, read
the manifest and every listed owner-resolution JSON whole before grounding.
Parent prose, conversation memory, and summaries are not authority.

When that adapter invocation has `Stage: resolution-check`, read the named
question-resolution artifact and return only this result, with no grounding
brief or narration:

```text
Resolved: yes | no
Lock: changed | unchanged
Resume: task-groundwork | to-spec | commit | review-stage
Basis: <absolute question-resolution artifact path> | sha256:<hash>
```

Verify the resolution JSON's source role/stage/mutation and `calling_phase`.
Return `Resume: task-groundwork`; this role cannot skip rebuilding the brief
and evidence seed. `Lock: changed` also resumes there.

Stop after this resolution result; the remaining grounding-output rules do not
apply to that invocation.

For a normal adapter grounding stage, write the completed brief's exact bytes
to the supplied `Groundwork artifact:` path. Copy the brief's exact four-field
Outcome lock, without commentary or paraphrase, to the supplied `Lock
artifact:` path. Also write the supplied `Evidence inventory:` artifact with
one entry for every decision-bearing repository source actually used:

```text
Path: <repository-relative path>
Role: <binding task | current behavior | acceptance | owner/path | constraint>
Blob: <full lowercase Git blob hash of the examined bytes>
State: committed | dirty | untracked
```

If no decision-bearing repository source was used, write the single line
`none`. Otherwise separate entries with one blank line, sort by `Path`, and do
not repeat a path.

Do not inventory routine paths that cannot change a decision. Hash dirty or
untracked evidence from its exact examined bytes rather than substituting the
index or HEAD version, and label its state exactly. The parent cannot include
dirty or untracked decision-bearing evidence in an immutable review basis; it
will return `BLOCKED` without reconciling that owner state. The inventory does
not replace citations or reasoning in the brief.

After writing and hashing a ready brief and inventory, write the supplied
`Groundwork status:` artifact in this exact form:

```text
Groundwork status
State: READY_FOR_SPEC
Basis:
Groundwork: <absolute path> | sha256:<hash>
Lock: <absolute path> | sha256:<hash>
Evidence inventory: <absolute path> | sha256:<hash>
```

When unavailable evidence materially blocks outcome, safety, or scope, do not
make the parent interpret prose. Write only this status form and return the
same exact blocker text:

```text
Groundwork status
State: BLOCKED
Basis:
Task: <absolute path> | sha256:<hash>
Blocker: <exact evidence limit>
```

A necessary owner question uses the shared question protocol and writes no
groundwork status until resolved. Its immutable return contains exactly one
non-empty single-line `Question: <text>`; the adapter treats the entire returned
bytes as evidence. Do not add another `Question:` line. Any other adapter
status or question grammar is invalid.

An explicit Codex task-to-spec run has already selected the spec path. Even
when the task is narrow, produce a concise ready grounding brief and its
artifacts; do not route it to direct execution as a negative-fit result.

## Establish fit and authority

Use the supplied task source as authority. A direct request is sufficient; do
not require a roadmap, ticket, predecessor, or spec unless the request makes it
controlling.

If the task is already narrow and its implementation boundary is clear, return
a short negative-fit brief instead of a generic 5W2H inventory. It still uses
the labels **Outcome lock**, **Non-goals and neighbor boundary**, **Viable
minimal paths**, and **Human decisions: none**; say why groundwork adds no decision value,
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

## Resolve the task and handoff authority

Derive the task purpose instead of repeating its title. Produce an **Outcome
lock** in prose with the four fields from the reference: owned outcome,
existing owner/path, neighbor boundary, and accepted residual. Quote the
binding outcome, owned observables, landed path this task will use, neighboring
work it will not absorb, and residuals it will not close. It preserves task
authority while leaving behaviorally equivalent local choices to the next
stage; it is not permission to invent a larger mechanism.

Use this decision rule for every unresolved branch:

- If an authoritative source can decide it, investigate and verify it.
- If all viable choices preserve every boundary and observable, leave it as
  implementation freedom.
- If evidence cannot decide and the choices change product behavior, scope,
  ownership, state, recovery, safety, or another observable, ask the human and
  wait.

If unavailable evidence can change outcome, safety, or scope, report the task
blocked by that evidence limit. Otherwise retain a `⚠️ UNVERIFIED` caveat for
the downstream author. Return ready for `to-spec` only when no necessary human
decision remains.

Ask one concrete question at a time in plain language. Explain only the viable
choices and consequences supported by current evidence. Continue the
conversation if the answer is incomplete; resume only when the issue is clear
or the human stops the work. Do not complete or save the grounding brief while
a necessary question remains. Freeze resolved answers in the brief. Repository
defects, security findings, credible edge cases, and proof gaps are evidence;
they do not enlarge the Outcome lock by themselves.

Eliminate impossible, unsafe, or out-of-scope routes with evidence. Use
repository precedent and constraints for technical choices, keep current,
future, and deferred work separate, and do not manufacture a decision from
hypothetical external state. A bounded expiry consequence does not pull
migration, dual-read, or rollout machinery into scope unless evidence makes it
necessary. An unowned correctness, security, compatibility, money, or
production invariant does not enlarge the Outcome lock; ask its owner when the
binding decision is genuinely missing.

A landed owner is a path to use; neighboring work remains outside this task.
A missing local interface is not permission to rebuild the landed owner.

Never defer a material decision, change task scope, or pull future work forward
without explicit approval. Default to read-only investigation and safe
non-mutating checks. After a ready positive-fit brief is complete, write the
`.workflow/` sidecar below; ask before any other repository write. Do not write
spec or code. A narrow negative-fit or human-stopped result writes no sidecar.

## Return the grounding brief

Return the smallest brief that makes the next stage safe. For every
positive-fit brief, use all four exact headings below; none is omittable. Use
`none` where a heading has no remaining content. The narrow negative-fit
result remains the exception.

- **Outcome lock:** owned outcome, existing owner/path, neighbor boundary, and
  accepted residual.
- **Non-goals and neighbor boundary:** excluded behavior and its owner. Not a
  list of landed hazards.
- **Viable minimal paths:** evidence-backed routes, eliminations, and the
  least-widening safe route that uses landed owners rather than owning a
  parallel machine.
- **Human decisions:** each decision made during the grounding conversation
  and its binding consequence; write `none` when no human decision was needed.

Also include decision-relevant current-system evidence, assumptions and
`⚠️ UNVERIFIED` caveats, why investigation stopped, and whether the task is
ready for specification or direct execution. Cite files and lines for
file-backed facts. Do not invoke the next skill while a question or material
evidence blocker remains.

Return the completed brief directly. Do not leave a research plan, approval
wrapper, or instructions for a later response in place of the brief.

After a completed ready positive-fit brief exists, write those same bytes to
`.workflow/YYYY-MM-DD-HHMM-task-groundwork.md` using the local clock. Create
`.workflow/` if needed. Still return the same brief in chat. This sidecar is
the only briefing-file exception. Do not write spec or code. In Codex adapter
mode, the supplied `Groundwork artifact:` path replaces this timestamped
sidecar; also write the separate lock, evidence inventory, and status artifacts
defined above, and create no duplicate briefing sidecar.

If the result is the existing negative-fit / already-narrow brief
(implementation boundary already clear, groundwork adds no decision value),
return it in chat only. Do not write the sidecar or create `.workflow/`.

Stop as obsolete or misframed when the artifacts prove the requested task
should not proceed.
