# Shape

## Required update

Resolve the session's server-bound pending intent. When the amount is positive and the binding exists, update that provider intent. Browser IDs are ignored as authority. Otherwise preserve the local coupon result with no provider call.

## Added lifecycle framework

Create and bind a replacement intent for a missing session binding. Cancel and compensate an intent for zero total. Persist `PendingCouponTransition`, derive a SHA-256 key, publish transition completion with the coupon result in a cross-row transaction, replay incomplete publication, and partition confirmation identity by payment family.
