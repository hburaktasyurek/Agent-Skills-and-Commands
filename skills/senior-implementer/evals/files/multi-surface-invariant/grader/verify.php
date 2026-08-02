<?php

$root = $argv[1] ?? null;
if ($root === null) {
    fwrite(STDERR, "usage: php verify.php <workspace>\n");
    exit(2);
}

require_once $root . '/src/Store.php';
require_once $root . '/src/HttpEntry.php';
require_once $root . '/src/CsvEntry.php';
require_once $root . '/src/CliEntry.php';

$directStore = new Store();
$directRejected = false;
try {
    $directStore->save(" \t ");
} catch (DomainException) {
    $directRejected = true;
    if ($directStore->identifiers() !== []) {
        throw new RuntimeException('Store mutated before rejecting a blank identifier.');
    }
}

if (!$directRejected) {
    throw new RuntimeException('Store did not reject a blank identifier with DomainException.');
}

$validDirectStore = new Store();
$validDirectStore->save(' account-root ');
if ($validDirectStore->identifiers() !== ['account-root']) {
    throw new RuntimeException('Store changed valid identifier normalization.');
}

function assertRejects(string $entryClass, string $value): void
{
    $store = new Store();
    $entry = new $entryClass($store);

    try {
        $entry->import($value);
    } catch (DomainException) {
        if ($store->identifiers() !== []) {
            throw new RuntimeException($entryClass . ' stored before rejection.');
        }

        return;
    }

    throw new RuntimeException($entryClass . ' accepted a blank identifier.');
}

foreach ([HttpEntry::class, CsvEntry::class, CliEntry::class] as $entryClass) {
    assertRejects($entryClass, " \t ");

    $store = new Store();
    (new $entryClass($store))->import(' account-9 ');
    if ($store->identifiers() !== ['account-9']) {
        throw new RuntimeException($entryClass . ' changed valid identifier behavior.');
    }
}

echo "multi-surface invariant passed\n";
