<?php

final class BrowserRoutes
{
    public function page(TransportConfig $config): string
    {
        $options = $config->serverOptions();
        return '<script>window.transport=' . json_encode($options) . '</script>';
    }

    public function callback(TransportConfig $config, callable $send): void
    {
        $method = 'server' . 'Options';
        $payload = $config->{$method}();
        $send(['data' => $payload]);
    }
}
