# Coupon amount synchronization spec

## Required path

`CouponHandler::apply` resolves the server-bound pending intent and calls `Provider::update(intentId, amount)` once only for a positive amount and existing binding. Browser intent IDs are ignored as authority. Missing bindings and zero amounts return the local coupon result with no provider call.

Nonce and booking-session authorization reject before any local session write, database write, or provider retrieve/update. A failed provider retrieve returns non-success, performs zero `Provider::update` calls, and does not write further local coupon state.

## Sibling fence

`CheckoutRenderer::render` still calls `Provider::create` on each render. That owner, plus cancel/compensation, confirmation identity, and durable publication/recovery, stays outside this child. This spec does not consume or replace that renderer.

## Acceptance

- Positive amount with an existing server binding: one `Provider::update` of that intent.
- Missing binding or zero amount: local coupon result, zero provider calls.
- Missing/invalid nonce: non-success, zero local writes, zero retrieve/update.
- Retrieve failure: non-success, zero update, no further local write.
- Browser intent ID is never the resolved target.
