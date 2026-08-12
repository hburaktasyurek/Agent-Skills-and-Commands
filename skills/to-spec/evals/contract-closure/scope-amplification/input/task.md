# Coupon amount synchronization

When a coupon is applied, preserve the existing local `CouponResult` and update the amount of the **existing server-bound pending intent** only when the requested amount is positive. Resolve that intent through `PendingIntentStore::forSession($sessionId)`; the browser-provided intent ID is not authority.

If no server binding exists or the amount is zero, return the unchanged local coupon result and make no provider call.

## Non-goals and sibling owners

Intent lifecycle owns creation and replacement. Zero-total cancellation owns cancellation and provider compensation. Confirmation identity owns browser/server identity across payment families. Durable publication owns transition persistence, retries, idempotency, and recovery. None is in this task.

## Acceptance

`CouponHandler::apply(string $sessionId, string $browserIntentId, int $amount): CouponResult` returns the same local coupon outcome it returned before. For a positive amount and an existing server binding it calls `Provider::update($intentId, $amount)` once; otherwise it makes no provider call.
