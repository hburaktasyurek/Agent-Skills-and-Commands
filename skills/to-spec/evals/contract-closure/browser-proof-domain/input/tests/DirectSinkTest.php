<?php

// Existing correlated check: it inventories literal direct calls only.
assert(strpos(file_get_contents(__DIR__ . '/../src/Transport.php'),
    'echo $this->serverOptions()') === false);
