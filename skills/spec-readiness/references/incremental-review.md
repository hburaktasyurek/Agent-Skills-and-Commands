# Incremental review

Use incremental mode only when the caller supplies the current spec and the
complete prior report unchanged with its exact artifact basis; task identity,
scope, and acceptance are unchanged; and every current change is a finding
correction or required consequence. A path, revision summary, or old finding
list is not a complete handoff.

Reset to full for a mismatched or incomplete handoff, unexplained change, or a
new work package, public type, dependency, ownership/persistence boundary, or
activation path.

In incremental mode judge the current spec and:

1. Mark every prior finding `resolved`, `still present`, or `superseded` with
   current evidence.
2. Rebuild prior decision families, revision-touched edges, and their
   interaction neighbors at full structural depth.
3. Run the reverse pass on that set and a bounded residual check on controlling
   acceptance paths and the highest-consequence in-scope handoff.
4. Preserve an existing ordered exhaustive partition; check empty rows,
   contradictions, and missing consequence rows instead of redesigning it.
5. Include any new structural Blocker as `new-out-of-batch` once. Do not drop
   it to force READY or reopen resolved families for re-litigation.

READY still requires zero Blockers. An interaction-neighbor Blocker does not
by itself invalidate incremental mode.
