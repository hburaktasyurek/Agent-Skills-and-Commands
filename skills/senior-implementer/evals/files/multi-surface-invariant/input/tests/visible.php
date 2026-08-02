<?php

require_once __DIR__ . '/../src/Store.php';
require_once __DIR__ . '/../src/HttpEntry.php';
require_once __DIR__ . '/../src/CsvEntry.php';
require_once __DIR__ . '/../src/CliEntry.php';

function expectDomainException(callable $operation): void
{
    try {
        $operation();
    } catch (DomainException) {
        return;
    }

    throw new RuntimeException('Expected DomainException.');
}

$httpStore = new Store();
expectDomainException(fn () => (new HttpEntry($httpStore))->import('   '));

$cliStore = new Store();
expectDomainException(fn () => (new CliEntry($cliStore))->import("\t"));

$validStore = new Store();
(new HttpEntry($validStore))->import(' account-7 ');
if ($validStore->identifiers() !== ['account-7']) {
    throw new RuntimeException('Valid identifier behavior changed.');
}

echo "visible php checks passed\n";
