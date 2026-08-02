<?php

final class CsvEntry
{
    public function __construct(private Store $store)
    {
    }

    public function import(string $rawIdentifier): void
    {
        if ($rawIdentifier === '') {
            throw new DomainException('Account identifier is required.');
        }

        $this->store->save(trim($rawIdentifier));
    }
}
