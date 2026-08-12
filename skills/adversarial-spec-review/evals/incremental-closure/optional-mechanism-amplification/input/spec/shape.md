# Shape

## Required coupon outcome

`CouponHandler::apply` resolves the server-bound pending intent and, only for a positive amount with that binding, calls `Provider::update(intentId, amount)`. The browser ID is ignored as authority. Missing binding and zero amount keep the local coupon result with no provider call.

## Added lifecycle framework

When no binding exists, create a replacement intent and bind it to the session. For zero amount, cancel the existing intent and compensate any partial provider effect. Persist a `PendingCouponTransition` before every provider operation. Give each transition a SHA-256 idempotency key and publish the coupon result and transition completion through a custom cross-row transaction with recovery replay.

The existing browser confirmation ID remains unchanged while the framework partitions confirmation identity by payment family.
