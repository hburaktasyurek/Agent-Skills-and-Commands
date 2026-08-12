# Plan

1. Persist `PendingCouponTransition` and generate its SHA-256 idempotency key.
2. Create and bind replacement intents for missing bindings.
3. Cancel and compensate intents for zero-total coupons.
4. Publish transition completion and coupon result atomically with replay recovery.
5. Partition browser and server confirmation identity by payment family.
6. Update the existing server-bound pending intent for a positive amount; no-op for missing binding or zero amount.
