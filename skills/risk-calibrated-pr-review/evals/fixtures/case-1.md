# Case 1: fleet-wide startup failure

## Frozen PR snapshot

- PR: 42
- Base: `2222222222222222222222222222222222222222`
- Head: `3333333333333333333333333333333333333333`
- Head remained stable through the end of review.
- The complete base-to-head diff removes `critical-runtime` from the production
  package manifest. It does not change `service.js`, which still imports that
  package before startup. There are no other changed files.

## Commissioning and system facts

Merge automatically starts a rolling replacement of every live service
instance. Each replacement uses the changed manifest, so every replacement
fails before it can serve traffic. There is no alternate serving path or
automatic rollback. Recovery requires restoring the manifest, rebuilding the
image, and redeploying it.
