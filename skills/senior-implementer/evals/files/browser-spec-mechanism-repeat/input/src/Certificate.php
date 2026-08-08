<?php

final class Certificate
{
    public function __construct(private string $approvedBy)
    {
    }

    public function jsonSerialize(): array
    {
        return ['approved_by' => $this->approvedBy];
    }
}
