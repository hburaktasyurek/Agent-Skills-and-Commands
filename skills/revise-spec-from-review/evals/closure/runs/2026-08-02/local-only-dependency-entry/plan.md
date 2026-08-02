# Plan

## Proposed correction

Close local-only entry without requiring provider acquisition. Do not treat a
control-flow-only reorder of an availability check as sufficient while
production wiring still eagerly builds `ProviderTransport` before the service
exists.

## Acceptance criteria

- `abandon_before_http` and `release_after_terminal` are enterable when provider
  dependency acquisition is configured to fail, with zero provider acquisition
  and zero provider I/O.
- `retry_provider_operation` still fails closed before durable mutation when
  the provider dependency cannot be acquired.
- Observable construction/branch-entry behavior is specified; architecture
  choice (lazy factory, resolver, split) remains implementation freedom.

## Implementation tasks

1. Make both local-only actions invocable on the production path without
   provider acquisition.
2. Keep provider retry fail-closed before mutation on acquisition failure.
3. Tests: throwing provider acquisition — local actions succeed with zero
   provider work; retry does not mutate.
