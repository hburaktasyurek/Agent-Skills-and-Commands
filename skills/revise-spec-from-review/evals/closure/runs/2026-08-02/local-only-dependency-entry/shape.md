# Shape

## Public command

`RecoveryService::execute(RecoveryAction $action, AttemptId $attemptId)` owns
all three recovery actions described in `task-contract.md`.

## Construction and production wiring

Production may build a `ProviderTransport` only when a provider-touching action
needs it. `RecoveryService` must be constructible and invocable for
`abandon_before_http` and `release_after_terminal` when provider credentials or
the provider endpoint are unavailable, with zero provider acquisition and zero
provider I/O on those paths.

Provider-dependent `retry_provider_operation` acquires transport (or equivalent
dependency) only on that branch; if acquisition fails, it fails closed before
any attempt, ownership, or other durable mutation.

## Current control flow

`abandon_before_http` and `release_after_terminal` mutate only the local
attempt store and never call provider APIs. `retry_provider_operation` performs
provider work only after the provider dependency is available.

## Failure rule

`ProviderUnavailable` (or equivalent acquisition failure) stops
provider-dependent recovery before any durable mutation. It must not prevent
entry to the two local-only actions.

## Out of scope

Activation of recovery and selection of a replacement construction
architecture (resolver vs lazy factory vs split services remain implementation
freedom).
