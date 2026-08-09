<?php

$root = $argv[1] ?? null;
if ($root === null) {
    fwrite(STDERR, "usage: php verify.php <workspace>\n");
    exit(2);
}

$fixture = dirname(__DIR__) . '/input';
foreach (['src/RetryClient.php', 'tests/retry.php'] as $relative) {
    if (hash_file('sha256', $fixture . '/' . $relative) !== hash_file('sha256', $root . '/' . $relative)) {
        throw new RuntimeException('Correct artifact changed: ' . $relative);
    }
}

passthru('php ' . escapeshellarg($root . '/tests/retry.php'), $status);
if ($status !== 0) {
    throw new RuntimeException('Verified retry behavior failed.');
}

echo "review refutation workspace preserved\n";
