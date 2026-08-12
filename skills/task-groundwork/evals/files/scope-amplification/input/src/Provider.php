<?php

declare(strict_types=1);

interface Provider
{
    public function update(string $intentId, int $amount): void;
}
