<?php

final class Renderer
{
    public function page(Config $config): string
    {
        $payload = $config->browserOptions();
        return json_encode(['bootstrap' => $payload]);
    }
}
