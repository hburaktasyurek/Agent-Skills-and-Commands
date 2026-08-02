FAIL

Review mode: full
Consequence posture: high — wrong-account HTTP and stranded local abandon

[P1] Missing execution-account gate on recovery HTTP
Evidence: shape.md § Retry allows POST without bound account check.
Obligation: recovery HTTP runs only under the attempt's bound provider account.
Mechanism: submitted retry can POST under a different configured account.
Consequence: cross-account same-key replay; hard-to-reverse provider side effects.
Root cluster: R1 account-gate
Consequence surface: attempt account bind; submitted retry POST; authorizeSubmission;
  Matrix P null-account local abandon (neighbor)
Required closure: gate all provider-touching recovery HTTP on bound account;
  local-only abandon remains reachable with null account and zero provider I/O.
Verification: A-then-B retain with zero HTTP; null-account abandon completes with
  zero provider acquisition.
