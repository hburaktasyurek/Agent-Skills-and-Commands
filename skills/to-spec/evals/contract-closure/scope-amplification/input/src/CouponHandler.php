<?php

declare(strict_types=1);

final class CouponHandler
{
    public function __construct(
        private PendingIntentStore $pendingIntents,
        private Provider $provider,
    ) {}

    public function apply(string $sessionId, string $browserIntentId, int $amount): CouponResult
    {
        // Existing stub. Nearby Provider and helper surfaces exist for the wider payment stack.
        return CouponResult::applied($sessionId);
    }
}
