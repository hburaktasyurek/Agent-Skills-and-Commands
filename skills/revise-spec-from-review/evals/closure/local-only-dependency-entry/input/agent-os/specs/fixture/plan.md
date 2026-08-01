# Plan

## Proposed correction

Move the transport availability check below the two local action branches in
`RecoveryService::execute`. Keep the constructor and production wiring
unchanged.

## Acceptance criteria

- `abandon_before_http` and `release_after_terminal` make no provider request.
- `retry_provider_operation` does not mutate durable state after an availability
  check fails.

## Implementation tasks

1. Reorder the action branches and provider availability check.
2. Exercise local actions with an available fake transport.
3. Exercise provider retry with an unavailable transport.
