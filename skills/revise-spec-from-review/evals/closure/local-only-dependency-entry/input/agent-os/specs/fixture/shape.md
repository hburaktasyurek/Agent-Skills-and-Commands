# Shape

## Public command

`RecoveryService::execute(RecoveryAction $action, AttemptId $attemptId)` owns
all three recovery actions described in `task-contract.md`.

## Construction and production wiring

`RecoveryService::__construct(ProviderTransport $transport, AttemptStore $store)`
requires a provider transport. Production wiring calls
`ProviderTransportFactory::build()` before constructing the service. The build
loads provider credentials and checks the provider endpoint, so it throws
`ProviderUnavailable` during the outage in the review.

## Current control flow

`execute` checks transport availability before dispatching the action.
`abandon_before_http` and `release_after_terminal` then mutate only the local
attempt store and make no provider request. `retry_provider_operation` uses the
transport after the availability check and mutates durable state only after the
required provider dependency is available.

## Failure rule

`ProviderUnavailable` stops provider-dependent recovery before any attempt,
ownership, or other durable mutation.

## Out of scope

Activation of recovery and selection of a replacement construction
architecture.
