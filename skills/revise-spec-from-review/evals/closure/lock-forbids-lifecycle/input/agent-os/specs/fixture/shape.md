# Shape

## Required update

Resolve the session's server-bound pending intent. When the amount is positive and the binding exists, update that provider intent. Browser IDs are ignored as authority. Otherwise preserve the local coupon result with no provider call.

## Sibling fence

`CheckoutRenderer::render` may still call `Provider::create`. Creation, replacement, cancellation, and transaction/recovery stay with sibling owners.
