<?php

final class CustomerExport
{
    public function response(string $email): array
    {
        return ['email' => $email];
    }
}
