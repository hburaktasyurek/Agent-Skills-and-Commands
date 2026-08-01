# References

- `task-contract.md` is the binding behavior source.
- Current production wiring eagerly builds `ProviderTransport` before it can
  construct `RecoveryService`.
- Current provider retry stops before durable mutation when provider dependency
  acquisition fails.

## Unverified claims

Exact count: 0. The review concerns a documented construction path and binding
availability outcomes.
