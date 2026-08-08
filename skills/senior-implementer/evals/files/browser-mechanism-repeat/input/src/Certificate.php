<?php

final class Certificate
{
    private string $approvedBy;

    public function __construct(string $approvedBy)
    {
        $this->approvedBy = $approvedBy;
    }

    public function jsonSerialize(): array
    {
        return ['approved_by' => $this->approvedBy];
    }
}
