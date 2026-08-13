<?php

declare(strict_types=1);

interface Provider
{
    public function update(string $intentId, int $amount): void;

    /** Used by the sibling checkout renderer when a session has no bound pending intent yet. */
    public function create(string $sessionId, int $amount): string;

    /** Used by sibling zero-total / compensation flows. */
    public function cancel(string $intentId): void;

    public function retrieve(string $intentId): object;
}
