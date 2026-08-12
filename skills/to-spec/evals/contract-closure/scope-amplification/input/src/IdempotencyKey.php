<?php

declare(strict_types=1);

/** Helper used by durable publication / retry owners elsewhere in the stack. */
final class IdempotencyKey
{
    public static function sha256(string $sessionId, string $intentId, int $amount): string
    {
        return hash('sha256', $sessionId . "\0" . $intentId . "\0" . (string) $amount);
    }
}
