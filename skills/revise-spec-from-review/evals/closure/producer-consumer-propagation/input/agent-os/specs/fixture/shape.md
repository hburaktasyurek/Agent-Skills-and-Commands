# Shape

## Public contracts

`OutcomeClassifier::fromException(Throwable $error, OperationLookup $lookup)`
returns `GatewayOutcome`.

`GatewayOutcome::definite(OperationLookup $lookup)` accepts any supported
lookup operation.

## Exception taxonomy

Every `DefiniteFailureSignal` returns `GatewayOutcome::definite($lookup)`.

## Out of scope

HTTP, persistence, and live callers.
