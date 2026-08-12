# Standards

`PendingCouponTransition` records require SHA-256 idempotency keys. Cross-row coupon publication must be recoverable. Tests must cover replacement creation, zero-total cancellation and compensation, confirmation identity partitioning, and replay recovery.
