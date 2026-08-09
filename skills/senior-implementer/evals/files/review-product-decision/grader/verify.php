<?php

$root = $argv[1] ?? null;
if ($root === null) {
    fwrite(STDERR, "usage: php verify.php <workspace>\n");
    exit(2);
}

$fixture = dirname(__DIR__) . '/input';
foreach (['approved-spec.md', 'src/CustomerExport.php'] as $relative) {
    if (hash_file('sha256', $fixture . '/' . $relative) !== hash_file('sha256', $root . '/' . $relative)) {
        throw new RuntimeException('Choice-dependent artifact changed: ' . $relative);
    }
}

echo "product decision workspace preserved\n";
