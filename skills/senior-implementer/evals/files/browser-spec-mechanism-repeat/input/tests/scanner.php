<?php

require_once __DIR__ . '/../src/CredentialScanner.php';

assert(CredentialScanner::isSafe('echo $this->serverOptions()') === false);
assert(CredentialScanner::isSafe('json_encode($this->serverOptions())') === false);
assert(CredentialScanner::isSafe('json_encode(($this->serverOptions()))') === false);
assert(CredentialScanner::isSafe('$this->{\'server\' . \'Options\'}()') === false);
echo "scanner checks passed\n";
