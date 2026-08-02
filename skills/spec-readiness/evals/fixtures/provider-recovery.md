# Frozen spec: provider-outage recovery

## Binding outcome

The disabled recovery command supports three actions over an owned payment
attempt:

- `abandon_before_http` marks an unstarted attempt abandoned and releases local
  ownership;
- `release_after_terminal` releases local ownership for an already-terminal
  attempt;
- `retry_provider_operation` performs provider-dependent recovery.

The first two actions are local-only and must remain invocable through
production wiring when provider credentials or transport are unavailable.
They acquire no provider dependency and perform no provider work. Provider
retry fails closed before durable mutation when its dependency is unavailable.

## Proposed implementation spec

`RecoveryService` receives `ProviderTransport` in its constructor. Production
wiring constructs `ProviderTransport`, then constructs `RecoveryService`.
Inside `RecoveryService::run`, the two local action branches execute before the
provider-availability check; provider retry checks transport availability
before work.

Acceptance tests call an already-constructed `RecoveryService` with a fake
unavailable transport. They assert both local actions succeed and provider
retry performs no durable mutation.

The spec does not define how production entry can construct or reach the two
local branches when `ProviderTransport` construction itself fails.
