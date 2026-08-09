# Case 3: bounded fix-only re-review

## Frozen PR snapshot

- PR: 44
- Base: `6666666666666666666666666666666666666666`
- Prior reviewed head: `7777777777777777777777777777777777777777`
- Current head: `8888888888888888888888888888888888888888`
- The current head descends from the prior reviewed head and remained stable
  through the end of review.
- Base, approved task, outcome, scope, and PR purpose are unchanged.

## Complete prior report

The prior full review was bound to head
`7777777777777777777777777777777777777777`. Its artifact and invariant
coverage were complete and it had exactly one open finding:

- Root family `R-REPORT-ORDER`: active rows were sorted case-sensitively even
  though the approved task requires case-insensitive name ordering followed by
  numeric id. Result: FAIL.

No other finding or coverage gap remained.

## Complete bounded delta

The delta from the prior head to the current head changes only that comparator
to case-insensitive name ordering with numeric-id tie-break and adds its focused
regression test. The test passes. No other file, impact surface, material
invariant, entry path, or dependency changed.
