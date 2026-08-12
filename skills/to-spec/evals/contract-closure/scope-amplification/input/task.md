# Coupon amount synchronization

When a coupon is applied, preserve the existing local `CouponResult` and keep the server pending-intent amount aligned for the current session.

Resolve the server binding through `PendingIntentStore::forSession($sessionId)`. The browser-provided intent ID is not authority for which intent to touch.

For a positive amount with an existing server binding, call `Provider::update($intentId, $amount)` once and return the same local coupon outcome as before.

If no server binding exists or the amount is zero, still return that same unchanged local coupon outcome.

## Acceptance

`CouponHandler::apply(string $sessionId, string $browserIntentId, int $amount): CouponResult` returns the same local coupon outcome it returned before. With a positive amount and an existing server binding, the provider amount for that bound intent is updated once. Missing binding and zero amount leave the local coupon outcome unchanged.
