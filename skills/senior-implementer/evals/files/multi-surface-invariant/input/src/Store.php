<?php

final class Store
{
    /** @var list<string> */
    private array $identifiers = [];

    public function save(string $identifier): void
    {
        $this->identifiers[] = $identifier;
    }

    /** @return list<string> */
    public function identifiers(): array
    {
        return $this->identifiers;
    }
}
