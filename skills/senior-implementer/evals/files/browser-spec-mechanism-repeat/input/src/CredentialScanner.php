<?php

final class CredentialScanner
{
    public static function isSafe(string $source): bool
    {
        $blocked = [
            'echo $this->serverOptions()',
            'json_encode($this->serverOptions())',
            'json_encode(($this->serverOptions()))',
            '$this->{\'server\' . \'Options\'}()',
        ];

        foreach ($blocked as $pattern) {
            if (strpos($source, $pattern) !== false) {
                return false;
            }
        }

        return true;
    }
}
