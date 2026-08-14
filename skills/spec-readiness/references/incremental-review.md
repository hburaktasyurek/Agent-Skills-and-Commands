# Incremental review

Canonical re-review protocol for `spec-readiness`. The skill owns purpose,
threshold, ledger, and terminal output. This file owns mode selection and the
incremental procedure.

Read `references/outcome-lock.md` when scoring. Do not copy it.

## Convergence

Apply no numeric review-round or rewrite limit. A re-review remains NOT READY
while current evidence proves at least one structural Blocker and becomes READY
as soon as none remains. Review count, a repeated root, and difficulty closing a
root do not change the verdict and do not create a human question.

Every spec rewrite invalidates the prior readiness verdict. Ask the human only
when missing or contradictory binding authority requires their decision; after
the answer, freeze it and review the resulting spec in the same task.

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
   completion. A required existing owner/path is not neighboring work to
   complete.
3. Run the reverse pass on that set and a bounded residual check on controlling
   acceptance paths and the highest-consequence in-scope handoff — not an
   unrelated full-ledger re-sweep.
4. Preserve an existing ordered exhaustive partition; check empty rows,
   contradictions, and missing consequence rows instead of redesigning it.
5. For every current Blocker, explain in `Root and closure` whether the prior
   root remains, the prior review missed a different root already visible in
   its basis, or the revision made the root reachable. Name the decisive prior
   evidence or changed clause. Stay incremental: return every newly exposed
   same-outcome Blocker family in this batch; do not leave related roots for a
   later round or turn the omission into an unconditional full re-sweep. Do not
   drop a root to force READY or reopen resolved families for re-litigation.
6. For a repeated root, explain with current evidence whether the correction
   was incomplete or the prior diagnosis was wrong. Do not add a separate
   classification or repeat-diagnosis field.

READY still requires zero Blockers. If current Blockers remain, return the
complete root-batched NOT READY report in this turn. Do not return a review
ledger, approval card, or “emit on confirmation” outline in place of that
report.
