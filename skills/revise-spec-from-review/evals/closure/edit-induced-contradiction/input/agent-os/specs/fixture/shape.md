# Shape

## Public contracts

`OutcomeClassifier::fromException(Throwable $error, OperationLookup $lookup)`
returns `GatewayOutcome` for `debit.create` and `profile.create`.

`GatewayOutcome` exposes `definite`, `resolvedProfile`, and `unknown`
factories. Their operation and resource constraints are described by their
names but are not enumerated.

## Exception taxonomy

Every `HardDeclineSignal` returns `GatewayOutcome::definite($lookup)`. Embedded
debit resources are ignored for profile operations.

## Caller recommendation

The future caller applies the recommendation carried by the outcome.

## Out of scope

Live callers, persistence implementation, and activation.
