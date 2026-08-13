# Binding task contract

During coupon application, keep the existing local `CouponResult`. Only for a positive amount and an existing server-bound pending intent, resolve that intent with `PendingIntentStore::forSession(sessionId)` and call `Provider::update(intentId, amount)` once. Browser-provided intent IDs are not authority. Missing bindings and zero amounts make no provider call.

Non-goals and sibling owners: intent lifecycle owns create/replacement; zero-total cancellation owns cancel/compensation; checkout-instance lifecycle owns `CheckoutRenderer` and `Provider::create`; confirmation identity owns cross-family identity; durable publication owns transition state, idempotency, transactions, retries, and recovery. The live checkout renderer still calling `Provider::create` on each render is an accepted residual of this child.
