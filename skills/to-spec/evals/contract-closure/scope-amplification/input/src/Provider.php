<?php

declare(strict_types=1);

interface Provider
{
    public function update(string $intentId, int $amount): void;

    /** Used by intent lifecycle when a session has no bound pending intent yet. */
    public function create(string $sessionId, int $amount): string;

    /** Used by zero-total / compensation flows to drop a pending intent. */
    public function cancel(string $intentId): void;
}
