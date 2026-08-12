# Coupon amount synchronization

When a coupon is applied, preserve the existing local `CouponResult` and update the amount of the **existing server-bound pending intent** only when the requested amount is positive. Resolve that intent through `PendingIntentStore::forSession($sessionId)`; the browser-provided intent ID is not authority.

If no server binding exists or the amount is zero, return the unchanged local coupon result and make no provider call.

## Non-goals

Do not create, replace, or cancel intents. Do not add transition persistence, idempotency keys, publication/recovery protocols, or a cross-family identity design. Those lifecycle concerns belong to later roadmap tasks.

## Acceptance

`CouponHandler::apply(string $sessionId, string $browserIntentId, int $amount): CouponResult` returns the same local coupon outcome it returned before. For a positive amount and an existing server binding it calls `Provider::update($intentId, $amount)` once; otherwise it makes no provider call.
