# Re-review Protocol

Choose the mode before reusing any prior evidence.

## Incremental eligibility

Use `incremental` only when all of these are provable:

- the complete prior report and exact reviewed head are available;
- the prior head is an established ancestor of the current head;
- the complete delta is bounded and comparable;
- base, task outcome, scope, and PR purpose are unchanged;
- no new impact surface or material invariant appears; and
- prior coverage is adequate for every affected area.

Otherwise use `reset-to-full`. A fix-only label does not establish eligibility.

## Incremental review

1. Reread current task sources and PR metadata.
2. Compare the complete prior-head-to-current-head delta.
3. Reconcile every prior finding as `resolved`, `still present`, or
   `superseded` using current evidence.
4. Keep one stable Root family across repeated manifestations. Mark
   `same-root-residual` or `mechanism-level-repeat` from causal evidence, not
   review count.
5. Verify the correction mechanism, independent oracle, new hunks, affected
   callers and contracts, and every prior coverage gap.
6. Sweep the complete current PR boundary for unexpected changes.
7. Recompute impact and risk where the delta can affect them.
8. Switch immediately to `reset-to-full` if eligibility stops holding.

Reuse only evidence proven unchanged from its exact recorded baseline. In the
report, name the exact reused evidence, the current proof that it is unchanged,
and why its prior coverage is adequate for every affected area. Do not carry
forward old finding text as current evidence.

## Reset-to-full

Reuse no prior artifact, coverage, or correctness evidence. Preserve stable
Root families and learned attack families only as hypotheses to challenge
against the current revision.

An interrupted session, partial notes, missing reviewed-head receipt, or report
without complete coverage and a terminal result produced **no verdict** and no
incremental baseline.

Any implementation change after `PASS` invalidates that result. The reviewer
never fixes and certifies its own work.
