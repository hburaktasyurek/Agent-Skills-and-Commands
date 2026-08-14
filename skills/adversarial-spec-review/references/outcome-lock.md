# Outcome lock

Shared spec-path boundary contract. `task-groundwork` produces it, `to-spec`
freezes it, `adversarial-spec-review` and `spec-readiness` score it, and
`omp-task-to-spec` carries it between stages. Each package ships this identical
file as `references/outcome-lock.md`.

Record four things:

1. **Owned outcome** — the observable result, acceptance, and stop conditions
   this task must deliver.
2. **Existing owner/path** — the landed API, entity, or protocol already
   responsible for a result this task needs. Name the entry and its observable
   failure path; do not rebuild that owner's machine inside this task.
3. **Neighbor boundary** — adjacent work and its owner that this task must not
   absorb.
4. **Accepted residual** — a known leftover this task will not close, with its
   owner named or explicitly unowned.

Use the existing owner/path when it already owns the needed result. A missing
local interface is not permission to invent a parallel store, lifecycle,
publication path, recovery protocol, or create/replace/cancel owner. Current
code can show how the frozen outcome is reached; it cannot silently enlarge
that outcome.

When evidence cannot decide a choice that changes observable behavior, scope,
state, recovery, or ownership, ask the human one concrete question in plain
language and wait. Explain the viable choices and consequences supported by
the evidence; do not force them into a fixed menu. If the answer leaves the
issue open, continue the conversation. Resume only after the decision is clear
or the human stops the work.
