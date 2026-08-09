# Case 4: fix label hides a new invariant

## Frozen PR snapshot

- PR: 45
- Base: `9999999999999999999999999999999999999999`
- Prior reviewed head: `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`
- Current head: `bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb`
- The current head descends from the prior reviewed head and remained stable
  through the end of review.

## Complete prior report

The prior full review was bound to head
`aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`. It covered a retry-only change and
reported one retry finding. It did not inspect authorization state or shared
ownership because neither surface existed at that head.

## Complete current delta

The revision is labeled fix-only and corrects the prior retry finding, but the
complete delta also adds:

- a new authorization state that controls whether callers may claim a record;
- a new high-impact invariant asserting exclusive ownership of shared financial
  records under concurrent requests; and
- unit tests that cover only single-threaded happy paths.

Those new surfaces were not covered by the prior report. No independent
authorization matrix, real-database transaction evidence, or concurrent test
is supplied.
