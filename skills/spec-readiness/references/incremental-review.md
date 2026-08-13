# Incremental review

Canonical re-review protocol for `spec-readiness`. The skill owns purpose,
threshold, ledger, and terminal output. This file owns mode selection, shared
cycle semantics, and incremental procedure.

Read `references/outcome-lock.md` when scoring. Do not copy it.

## Shared cycle

`adversarial-spec-review` and `spec-readiness` share one `Review cycle` for one
unchanged spec revision: `first | rewrite-1 | stop`. The first review of a
task's spec is `first`. Review of the one allowed `to-spec` rewrite is
`rewrite-1`. A second gate on the same rewrite carries `rewrite-1`; it does
not increment. `rewrite-1` FAIL / NOT READY is the second FAIL: emit cycle
`stop` and the skill's Workflow stop. If prior is already `rewrite-1` or
`stop`, this review is `stop`. Map legacy `1/3` → `first`, `2/3` →
`rewrite-1`, `3/3` → `stop`. If a legacy prior report lacks the field, treat
its re-review as `rewrite-1` and record the limitation. Do not begin another
rewrite after `stop`.

After `stop` ends in `Workflow stop`, a human change to task authority begins a
new task at `first`. It does not silently reset the stopped task's counter.

## Mode

Use `incremental` only when the caller supplies the current spec and the
complete prior report unchanged with its exact artifact basis; task identity,
scope, and acceptance are unchanged; and every current change is a finding
correction or required consequence. A path, revision summary, or old finding
list is not a complete handoff.

Use `reset-to-full` for a mismatched or incomplete handoff, unexplained change,
or a new work package, public type, dependency, ownership/persistence boundary,
or activation path. An interaction-neighbor Blocker alone does not force reset.

## Procedure

Judge the current spec and:

1. For each prior finding, record only `resolved` | `still present` |
   `superseded` plus a current-evidence pointer (wording-only ≠ resolved).
2. Rebuild prior decision families, revision-touched edges, and their
   interaction neighbors at full structural depth. Owned-rule neighbors stay
   in this batch; unsupported-mechanism neighbors close by removal, not
   completion. `revision-induced` does not mean finish the new sentence.
   A required substrate-call is not a sibling to complete.
3. Run the reverse pass on that set and a bounded residual check on controlling
   acceptance paths and the highest-consequence in-scope handoff — not an
   unrelated full-ledger re-sweep.
4. Preserve an existing ordered exhaustive partition; check empty rows,
   contradictions, and missing consequence rows instead of redesigning it.
5. Classify every current Blocker as exactly one of:
   - `incomplete closure` — a prior root or its recorded `Root and closure`
     remains reachable;
   - `prior-review gap` — a different root was already detectable from the
     prior basis but was omitted; name that prior evidence and invalidate any
     prior coverage claim. Stay incremental: return every newly exposed
     same-outcome Blocker family in this batch; do not leave siblings for a
     later round and do not treat the gap as an unconditional full re-sweep;
   - `revision-induced` — the revision made the root reachable; name the
     changed clause.
   Do not drop any root to force READY or reopen resolved families for
   re-litigation.
6. For every repeated root id in `Root and closure`, add `Repeat diagnosis:
   incomplete revision | prior root diagnosis incorrect` with current
   evidence.

READY still requires zero Blockers. Finding shape and cycle-`stop` terminal
output are owned by the skill.

On cycle `stop` with residual Blockers, return the skill's compact `NOT READY`
report in this turn: bare verdict + `Basis:` (with `stop`) + Prior lines +
three-field Blocker(s) + `Workflow stop`. Do not return a review ledger,
approval card, or “emit on confirmation” outline in place of that report.
