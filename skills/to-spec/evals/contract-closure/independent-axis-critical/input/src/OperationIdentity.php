<?php

final class OperationIdentity
{
    public const PRIMARY_CREATE = 'primary.create';
    public const PRIMARY_UPDATE = 'primary.update';
    public const AUXILIARY_CREATE = 'auxiliary.create';

    public function __construct(
        private string $operationReference,
        private string $operation,
        private ?string $resourceId
    ) {
    }

    public function operationReference(): string
    {
        return $this->operationReference;
    }

    public function operation(): string
    {
        return $this->operation;
    }

    /**
     * primary.create and auxiliary.create begin without a provider resource.
     * primary.update begins with its owned primary resource.
     */
    public function resourceId(): ?string
    {
        return $this->resourceId;
    }

    /**
     * Returns a new identity only after object type, environment, command
     * metadata, and exact operation ownership have been verified.
     */
    public function withVerifiedCreateResource(
        string $expectedOperation,
        string $resourceId
    ): self {
        if ($this->operation !== $expectedOperation || $this->resourceId !== null) {
            throw new InvalidArgumentException('Invalid create binding');
        }

        return new self($this->operationReference, $this->operation, $resourceId);
    }
}
