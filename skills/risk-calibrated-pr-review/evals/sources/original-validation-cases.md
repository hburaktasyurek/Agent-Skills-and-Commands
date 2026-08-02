# Original validation cases

These four cases were the behavior table in the shipped
`risk-calibrated-pr-review/SKILL.md` at baseline commit `2b8647e`:

- Tiny manifest diff removes the sole runtime dependency before a fleet-wide
  rollout, causing every replacement to fail startup with no automatic rollback.
- Dormant database support claims concurrency-safe ownership of shared
  financial reservation rows without real-database or concurrency evidence.
- A fix-only revision has a complete prior report, exact reviewed head, bounded
  delta, unchanged purpose, adequate coverage, and no new surface or invariant.
- A revision labelled fix-only adds a new authorization state and reshapes a
  high-impact ownership invariant not covered by the prior report.
