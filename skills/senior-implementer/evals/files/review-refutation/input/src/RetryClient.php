<?php

final class RetryClient
{
    public function send(callable $transport): int
    {
        for ($attempt = 0; $attempt < 2; $attempt++) {
            $status = $transport();
            if ($status !== 503) {
                return $status;
            }
        }

        return 503;
    }
}
