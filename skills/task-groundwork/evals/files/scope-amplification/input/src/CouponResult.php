<?php

declare(strict_types=1);

final class CouponResult
{
    private function __construct(public readonly string $sessionId) {}

    public static function applied(string $sessionId): self
    {
        return new self($sessionId);
    }
}
