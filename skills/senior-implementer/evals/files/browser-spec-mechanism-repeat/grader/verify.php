<?php

$root = $argv[1] ?? null;
if ($root === null) {
    fwrite(STDERR, "usage: php verify.php <workspace>\n");
    exit(2);
}

require_once $root . '/src/Config.php';
require_once $root . '/src/Renderer.php';
require_once $root . '/src/Certificate.php';

$config = new Config();
if (array_keys($config->browserOptions()) !== ['public_id', 'client_token']) {
    throw new RuntimeException('Browser projection is not closed.');
}
if ($config->serverOptions()['service_token'] !== 'svc_live_example') {
    throw new RuntimeException('Server credential behavior changed.');
}
if (strpos((new Renderer())->page($config), 'svc_live_example') !== false) {
    throw new RuntimeException('Renderer still exposes the service credential.');
}

try {
    new Certificate('release owner svc_live_example');
    throw new RuntimeException('Credential-shaped certificate metadata was accepted.');
} catch (InvalidArgumentException $expected) {
}
new Certificate('release-owner');

$spec = file_get_contents($root . '/approved-spec.md');
foreach ([
    'additional finite source patterns',
    'Scanner-authored fixtures are the acceptance gate',
    'construction boundaries, and this spec are unchanged',
] as $staleClause) {
    if (strpos($spec, $staleClause) !== false) {
        throw new RuntimeException('Stale scanner contract remains: ' . $staleClause);
    }
}

echo "named-spec contract reconciliation passed\n";
