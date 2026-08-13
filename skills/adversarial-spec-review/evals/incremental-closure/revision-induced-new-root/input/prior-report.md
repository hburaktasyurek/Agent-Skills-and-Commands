FAIL

Review mode: full
Review cycle: first
Artifact basis: task.md; pre-revision spec/shape.md at fixture revision 1, which had no customer-notification behavior
Consequence posture: high — retries can create duplicate recovery events
[P1] Recovery events lack a durably persisted operation id
Evidence: shape.md did not require an id to be durable before recovery work or shared by retries and events.
Obligation: persist one operation id before the first attempt; every retry and recovery event, including customer notification, uses it.
Root cause: no canonical durable operation identity contract.
Root cluster: R1 recovery-operation-identity
Consequence surface: durable record; first attempt; retry scheduler; event producer; customer notification; event consumer
Required closure: persist one operation id before recovery work and require every retry and event, including notification, to use it.
Coverage receipt: full review of operation identity, retries, durable recording,
event emission, notification identity, and task notification ordering; R1 was the only reported P0/P1.
