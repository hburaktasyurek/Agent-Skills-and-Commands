NOT READY

Review mode: incremental
Review cycle: 2/3
Artifact basis: `evals/fixtures/third-cycle-prior-spec.md`
sha256 `8236a39c808daed15f58c45f1f9c5b6bd8beec4143dc9e7a0ec1c40852126e82`
Task contract: provider-unavailable retry has one joined pending record per logical recovery

[Blocker] Retry-pending identity remains unspecified
Evidence: the current retry contract leaves pending-record identity and repeated-call joining to implementation.
Task(s) / handoff: provider-unavailable branch -> RetryPending scheduler -> repeated recovery caller
Missing decision: the canonical identity and owner for RetryPending, plus the duplicate-call outcome
Root cause: no canonical retry-pending identity contract.
Root cluster: R1 retry-pending-identity
Consequence surface: provider-unavailable classification; scheduler; RetryPending persistence; repeated caller; retry worker; result and proof
Why structural: alternate identities create different retry records, ownership, side effects, and caller results.
Consequence: concurrent or repeated calls can create duplicate retries for one logical recovery.
Decision family / cascade: recovery identity -> RetryPending identity -> duplicate join -> retry worker ownership -> result
Required closure: select one canonical RetryPending identity/owner and define duplicate-call join behavior.
Verification: invoke two concurrent unavailable calls for one recovery and prove one pending record plus the exact returned result.
Coverage receipt: completed the classification, local-abandon, unavailable-retry, pending-record, repeated-call, state/result, and proof ledger rows.
