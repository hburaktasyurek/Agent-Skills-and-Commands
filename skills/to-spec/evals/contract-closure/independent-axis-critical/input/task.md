# Task — Add a disabled provider outcome classifier

Add three disabled support types for a future operation runner:

- `OperationLookup`
- `GatewayOutcome`
- `OutcomeClassifier`

The classifier must distinguish definite failure from ambiguous outcome while
preserving authoritative lookup identity. It may classify decoded provider
objects and provider exceptions for `primary.create`, `primary.update`, and
`auxiliary.create`.

The existing contracts are binding:

- provider objects must match the lookup operation's object family;
- `DefiniteFailureSignal` is valid only for primary operations, so an
  auxiliary pairing is rejected before an outcome is constructed;
- `AmbiguousSignal` may occur for every operation and may carry a provider
  object;
- when an ambiguous `primary.create` result reveals a verified primary
  resource, the exact ID must remain available to recovery after the returned
  value is discarded; and
- the future runner applies the outcome's recommendation through the existing
  `OperationAuthority` methods.

Use these public interfaces:

- `OperationLookup::__construct(OperationIdentity $identity)`,
  `identity(): OperationIdentity`, and
  `withVerifiedCreateResource(string $expectedOperation, string $id): self`;
- `GatewayOutcome::definite(OperationLookup $lookup)`,
  `unknown(OperationLookup $lookup)`,
  `resolvedAuxiliary(OperationLookup $lookup)`, and
  `apply(OperationAuthority $authority): void`;
- `OutcomeClassifier::fromObject(PrimaryResource|AuxiliaryResource $object,
  OperationLookup $lookup): GatewayOutcome`; and
- `OutcomeClassifier::fromException(Throwable $error,
  OperationLookup $lookup): GatewayOutcome`.

The outcome factories and `apply` must enforce these rules:

- `definite` accepts primary operations and applies `resolveDefinite`;
- `resolvedAuxiliary` accepts only `auxiliary.create` with a nonnull verified
  auxiliary ID and applies `resolveAuxiliary`;
- `unknown` accepts every operation; it applies
  `bindUnknownPrimaryCreate` when a verified primary ID was learned during
  `primary.create`, otherwise it applies `markUnknown`;
- a decoded primary object on a matching primary lookup returns `unknown`; a
  decoded auxiliary object on `auxiliary.create` returns
  `resolvedAuxiliary`; and
- every operation/object or operation/signal mismatch throws
  `InvalidArgumentException` before returning an outcome.

`GatewayOutcome::apply()` makes exactly one selected authority call. If that
call throws, `apply()` propagates the same throwable unchanged and performs no
retry, mapping, suppression, secondary authority call, or compensation. Any
partial effect remains owned by `OperationAuthority` and its caller. Outcomes
are immutable and not one-shot: invoking the same outcome again after a failure
is a new single attempt under the same rule.

`OperationLookup` accepts only the three supported operations. Its constructor
requires a null resource for both create operations and a nonempty primary ID
for `primary.update`; unsupported operations, empty IDs, and pre-populated
create identities throw `InvalidArgumentException`. Its proof method accepts
only a matching create operation with a null current resource and a nonempty
ID. The classifier calls that proof method only after matching the provider
object family to the operation. These rules are the observable provenance
boundary; no additional provenance representation is required.

For `AmbiguousSignal`, a matching embedded object follows the same identity
validation as `fromObject` but remains `unknown`; no embedded object leaves the
lookup unchanged. A primary object for `primary.update` must equal the lookup's
existing resource ID. The existing identity proof method is the only allowed
create binding mechanism.

Any other `Throwable` returns `unknown` with the lookup unchanged. Empty or
mismatched provider IDs are invalid public input and throw
`InvalidArgumentException` before an outcome or authority call.

This task adds no HTTP, persistence, orchestration, activation, or live caller.

Use the contracts and tests in this fixture as current-system evidence. Make
the public result constructible and consumable for every reachable pairing;
invalid pairings must have an explicit rejection contract. Produce the normal
four-file spec under `agent-os/specs/`.

The future implementation uses PHPUnit 10. Acceptance tests must be
table-driven where a finite operation set is quantified, and rejected public
inputs must assert exact `InvalidArgumentException` type before checking that
no authority method ran.
