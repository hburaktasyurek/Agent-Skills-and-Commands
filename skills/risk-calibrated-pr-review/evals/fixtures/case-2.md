# Case 2: dormant financial ownership support

## Frozen PR snapshot

- PR: 43
- Base: `4444444444444444444444444444444444444444`
- Head: `5555555555555555555555555555555555555555`
- Head remained stable through the end of review.
- The complete diff adds only a reservation-ownership persistence module and
  its in-memory tests.

## Approved task and activation facts

The module is the approved persistence path for a later release. No current
caller or enabled flag reaches it, so it is dormant/support-only at this head.
When integrated, it must establish exclusive ownership of shared financial
reservation rows under concurrent execution. The PR contains only in-memory
tests; it supplies no real-database transaction or concurrency evidence.
