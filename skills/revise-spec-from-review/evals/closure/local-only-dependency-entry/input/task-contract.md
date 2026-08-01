# Binding task contract

The disabled recovery command supports three actions over an owned payment
attempt:

- `abandon_before_http` marks an attempt abandoned when no provider request was
  started, then releases its local ownership;
- `release_after_terminal` releases local ownership when the attempt is already
  terminal;
- `retry_provider_operation` performs provider-dependent recovery.

The first two actions are local-only. They must remain constructible and
invocable through production wiring when provider credentials, transport, or
another provider dependency is unavailable. They acquire no provider
dependency and perform no provider work.

`retry_provider_operation` remains provider-dependent. If its required provider
dependency cannot be acquired, it fails closed before attempt, ownership, or
other durable state is mutated.

The contract selects these observable outcomes, not a resolver class, factory,
service split, or other construction architecture.
