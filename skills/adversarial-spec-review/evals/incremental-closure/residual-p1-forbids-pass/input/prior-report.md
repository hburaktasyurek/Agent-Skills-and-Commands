FAIL

Review mode: full
Consequence posture: high — wrong-account HTTP

[P1] Missing execution-account gate on recovery HTTP
Evidence: shape.md § Retry POST had no bound-account check.
Obligation: provider-touching recovery HTTP requires bound account match.
Mechanism: retry could POST under another account.
Consequence: cross-account replay.
Root cluster: R1 account-gate
Consequence surface: account bind; retry POST; null-account local abandon
Required closure: gate provider HTTP; local abandon stays provider-free when
  account is null.
Verification: A-then-B zero HTTP; null-account abandon zero provider I/O.
