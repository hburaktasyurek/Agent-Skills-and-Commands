<?php

final class Renderer
{
    public function page(Config $config): string
    {
        $bootstrap = $config->browserOptions();
        return json_encode(['bootstrap' => $bootstrap]);
    }
}
