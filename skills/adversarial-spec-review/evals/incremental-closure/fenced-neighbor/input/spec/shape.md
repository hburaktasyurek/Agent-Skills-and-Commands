# Shape

## Required coupon outcome

`CouponHandler::apply` resolves the server-bound pending intent and, only for a positive amount with that binding, calls `Provider::update(intentId, amount)`. The browser ID is ignored as authority. Missing binding and zero amount keep the local coupon result with no provider call.

Nonce and booking-session authorization must succeed before the provider update.

## Out of scope

Intent creation/replacement, cancellation, checkout-instance lifecycle, and durable publication/recovery remain sibling-owned. The live `CheckoutRenderer` may still call `Provider::create` on each render.
