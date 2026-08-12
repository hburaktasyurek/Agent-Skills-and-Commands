# Coupon amount synchronization spec

## Required path

`CouponHandler::apply` resolves the server-bound pending intent and calls `Provider::update(intentId, amount)` once only for a positive amount and existing binding. Browser intent IDs are ignored as authority. Missing bindings and zero amounts return the local coupon result with no provider call.

## Lifecycle architecture

Create and bind a replacement intent when no binding exists. Cancel and compensate the pending intent when amount is zero. Persist `PendingCouponTransition` before every provider operation. Generate a SHA-256 idempotency key for each transition. Publish transition completion and coupon result with a custom cross-row transaction, then replay incomplete publications during recovery. Partition browser and server confirmation identity across payment families.

## Acceptance

Test replacement creation, zero-total cancellation and compensation, transition replay recovery, confirmation identity partitioning, and the existing-pending positive update.
