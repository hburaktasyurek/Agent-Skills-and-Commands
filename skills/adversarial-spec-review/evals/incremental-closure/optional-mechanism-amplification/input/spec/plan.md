# Plan

1. Add `PendingCouponTransition` persistence and SHA-256 key generation before provider calls.
2. Create and bind replacement intents when `PendingIntentStore::forSession` returns no value.
3. Cancel and compensate the pending intent when the coupon amount is zero.
4. Publish coupon result and transition completion atomically; add recovery replay tests.
5. Partition browser and server confirmation identity by payment family.
6. Update an existing server-bound intent for a positive amount and assert that browser intent IDs are ignored as authority.
