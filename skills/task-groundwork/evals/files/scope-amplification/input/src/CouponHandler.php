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
        return CouponResult::applied($sessionId);
    }
}
