<?php

declare(strict_types=1);

/** Transition / recovery log used by durable publication owners elsewhere. */
interface PublicationLog
{
    public function record(string $transitionId, string $state): void;

    public function latest(string $transitionId): ?string;
}
