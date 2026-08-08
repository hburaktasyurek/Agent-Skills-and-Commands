<?php

final class Config
{
    public function serverOptions(): array
    {
        return [
            'public_id' => 'pub_example',
            'client_token' => 'client_example',
            'service_token' => 'svc_live_example',
        ];
    }

    public function browserOptions(): array
    {
        return $this->serverOptions();
    }
}
