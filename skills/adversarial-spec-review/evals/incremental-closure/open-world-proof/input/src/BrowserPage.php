<?php

function page($transport): string
{
    $options = $transport->serverOptions();
    return json_encode(['bootstrap' => $options]);
}

function callback($transport, $send): void
{
    $method = 'server' . 'Options';
    $send($transport->{$method}());
}
