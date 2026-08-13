<?php

declare(strict_types=1);

/** Sibling checkout owner. Not part of the coupon-amount child. */
final class CheckoutRenderer
{
    public function __construct(private Provider $provider)
    {
    }

    public function render(string $sessionId, int $amount): string
    {
        return $this->provider->create($sessionId, $amount);
    }
}
