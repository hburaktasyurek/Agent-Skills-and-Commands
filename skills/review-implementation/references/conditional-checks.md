# Conditional checks

Use a section only when repository evidence establishes that the corresponding
technology or risk is part of the reviewed change. These are prompts for
causal inspection, not automatic findings.

## Web frameworks

- Route, middleware, handler, provider, policy, and dependency registration
  match the framework's actual conventions.
- Request validation and authorization cover every reachable entry point.
- Serialization, nullable values, and frontend/API contracts agree.
- Relation access in collections does not introduce avoidable repeated queries.

## Tenant-scoped systems

- Reads, writes, authorization, uniqueness, jobs, and cache keys preserve the
  repository's tenant boundary.
- Scope columns, foreign keys, indexes, and nullability match the established
  storage model.
- Privileged or unscoped operations are explicit and justified by project
  policy.

## Durable or multi-record state

- Partial failure cannot leave a falsely successful or contradictory state.
- Transaction boundaries, retries, idempotency, cleanup, and concurrency match
  the reachable failure model.
- Migrations preserve live data and reverse safely where reversibility is a
  stated project requirement.

## Payments or sensitive data

- Provider authenticity checks, idempotency, retries, reconciliation, and
  durable state transitions follow repository and provider contracts.
- Secrets, credentials, payment data, and regulated personal data are not
  exposed through responses, logs, fixtures, or errors.
- Do not assume a particular provider or identifier. Name provider-specific
  requirements only when repository evidence establishes them.
