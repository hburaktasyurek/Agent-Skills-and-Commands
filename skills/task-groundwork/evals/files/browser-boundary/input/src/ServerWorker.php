<?php

final class ServerWorker
{
    public function connect(TransportConfig $config): string
    {
        return $config->serverOptions()['service_token'];
    }
}
