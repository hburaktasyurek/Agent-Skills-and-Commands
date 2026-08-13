<?php

declare(strict_types=1);

interface PendingIntentStore
{
    public function forSession(string $sessionId): ?string;
}
