# Standards

Every `PendingCouponTransition` must have a SHA-256 idempotency key. Lifecycle publication must recover incomplete cross-row transactions. Tests must cover replacement creation, zero-total cancellation, compensation, confirmation identity partitions, and replay recovery.
