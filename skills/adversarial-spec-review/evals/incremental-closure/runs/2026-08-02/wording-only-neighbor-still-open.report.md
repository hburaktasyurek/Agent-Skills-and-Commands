FAIL

Review mode: incremental
Artifact basis: eval fixture spec/plan.md + spec/shape.md; prior-report.md
Consequence posture: high — stranded local abandon under provider outage; soft gate allows wrong-account HTTP
Task contract: provider-free null-account abandon; no wrong-account recovery HTTP

Prior-finding reconciliation:
- R1 account-gate: still present — shape.md § Account gate only says "should prefer" when present; no hard match/retain. Local abandon neighbor still requires ProviderTransport construction (shape.md § Local abandon).

[P1] Account gate still soft; wrong-account HTTP remains reachable
Evidence: shape.md § Account gate — "should prefer … when present"; no mismatch → RETAINED/zero HTTP rule.
Obligation: provider-touching recovery HTTP requires bound account equality.
Mechanism: prefer-language does not block POST under a different configured account.
Consequence: cross-account same-key replay.
Root cluster: R1 account-gate
Consequence surface: account bind; submitted retry POST; authorizeSubmission
Required closure: hard gate with zero HTTP/mutation on mismatch.
Verification: A-then-B retain with zero HTTP.

[P1] Local-only null-account abandon still requires ProviderTransport
Evidence: shape.md § Local abandon — abandon only after ProviderTransport construction; construction failure blocks abandon.
Obligation: never-submitted null-account abandon completes with zero provider acquisition/I/O.
Mechanism: eager transport construction leaves local abandon unreachable during provider outage.
Consequence: stranded allocated work; incomplete closure of R1 neighbor.
Root cluster: R1 account-gate (incomplete closure / interaction neighbor)
Consequence surface: RecoveryService construction; ProviderTransport build; Matrix P/S2 null-account abandon; provider-free path
Required closure: local abandon enterable without provider transport; provider retry still fail-closed.
Verification: throwing transport factory — abandon completes zero provider I/O; retry does not mutate.

Coverage receipt: prior R1 not resolved (wording-only); neighbor local-abandon checked and still open; residual on controlling abandon/outage path same P1; no new-out-of-batch beyond R1 family; stopped with open P0/P1.
Next: revise-spec-from-review
