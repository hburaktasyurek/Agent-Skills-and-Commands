<?php

final class Transport
{
    public function serverOptions(): array
    {
        return [
            'public_id' => 'pub_example',
            'client_token' => 'client_example',
            'service_token' => 'svc_live_example',
        ];
    }

    public function renderPage(): string
    {
        $payload = $this->serverOptions();
        return json_encode(['bootstrap' => $payload]);
    }

    public function send(callable $responder): void
    {
        $name = 'server' . 'Options';
        $responder($this->{$name}());
    }
}
