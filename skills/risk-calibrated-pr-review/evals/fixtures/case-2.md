# Case 2: dormant financial ownership support

PR 43 adds a reservation-ownership persistence module for an approved later
release. No current caller or enabled flag reaches it. The module claims safe
ownership of shared financial reservation rows, but the PR contains only
in-memory tests; there is no real-database or concurrent-execution evidence.
