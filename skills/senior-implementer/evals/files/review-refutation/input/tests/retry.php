<?php

require_once __DIR__ . '/../src/RetryClient.php';

$calls = 0;
$status = (new RetryClient())->send(function () use (&$calls): int {
    $calls++;
    return $calls === 1 ? 503 : 200;
});

assert($status === 200);
assert($calls === 2);
echo "retry behavior passed\n";
