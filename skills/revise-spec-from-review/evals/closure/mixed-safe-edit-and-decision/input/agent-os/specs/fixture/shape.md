# Shape

## Public contracts

`OutcomeClassifier::fromException(Throwable $error, OperationLookup $lookup)`
supports `primary.create`, `primary.update`, and `auxiliary.create`.

`GatewayOutcome::definite(OperationLookup $lookup)` accepts every supported
operation.

## Exception taxonomy

Every `DefiniteFailureSignal` returns `GatewayOutcome::definite($lookup)`.

Primary `AmbiguousExpirySignal` returns an unknown outcome. The
`auxiliary.create` behavior is not defined.

## Caller recommendation

The future caller follows the recommendation carried by a returned outcome.

## Out of scope

Recovery implementation and live callers.
