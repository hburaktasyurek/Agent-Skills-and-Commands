<?php

require_once __DIR__ . '/../src/Config.php';
require_once __DIR__ . '/../src/Renderer.php';

$config = new Config();
assert($config->serverOptions()['service_token'] === 'svc_live_example');
assert(strpos((new Renderer())->page($config), 'pub_example') !== false);
echo "visible checks passed\n";
