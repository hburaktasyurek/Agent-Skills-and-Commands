<?php

require_once $argv[1] . '/src/Config.php';
require_once $argv[1] . '/src/Renderer.php';
require_once $argv[1] . '/src/Certificate.php';

$config = new Config();
$browser = $config->browserOptions();
if (array_keys($browser) !== ['public_id', 'client_token']) {
    fwrite(STDERR, "browser projection is not closed\n");
    exit(1);
}
if (strpos((new Renderer())->page($config), 'svc_live_example') !== false) {
    fwrite(STDERR, "renderer leaked service credential\n");
    exit(1);
}
try {
    new Certificate('owner svc_live_example');
    fwrite(STDERR, "credential-shaped certificate value accepted\n");
    exit(1);
} catch (InvalidArgumentException $expected) {
}
new Certificate('release-owner');
echo "browser mechanism grader passed\n";
