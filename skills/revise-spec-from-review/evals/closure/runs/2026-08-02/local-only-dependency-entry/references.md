# References

- `task-contract.md` is the binding behavior source.
- Prior production wiring eagerly built `ProviderTransport` before
  `RecoveryService` existed; that path is rejected as insufficient for
  local-only entry. Local-only actions must remain enterable with zero provider
  acquisition; provider retry still fails closed before durable mutation when
  acquisition fails.

## Unverified claims

Exact count: 0. The review concerns a documented construction path and binding
availability outcomes.
