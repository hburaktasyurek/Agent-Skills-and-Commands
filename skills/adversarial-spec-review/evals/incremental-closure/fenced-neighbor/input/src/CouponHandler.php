<?php

declare(strict_types=1);

final class CouponHandler
{
    public function __construct(
        private PendingIntentStore $pendingIntents,
        private Provider $provider,
    ) {
    }

    public function apply(string $sessionId, string $browserIntentId, int $amount, ?string $nonce): CouponResult
    {
        $this->writeLocalCoupon($sessionId, $amount);

        if ($nonce === null || $nonce === '') {
            return CouponResult::rejected($sessionId);
        }

        $intentId = $this->pendingIntents->forSession($sessionId);
        if ($intentId === null || $amount <= 0) {
            return CouponResult::applied($sessionId);
        }

        $this->provider->update($intentId, $amount);

        return CouponResult::applied($sessionId);
    }

    private function writeLocalCoupon(string $sessionId, int $amount): void
    {
    }
}
