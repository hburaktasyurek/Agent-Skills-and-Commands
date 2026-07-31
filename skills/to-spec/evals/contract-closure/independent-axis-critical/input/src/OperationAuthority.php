<?php

interface OperationAuthority
{
    /** Accepts primary.* operations only. A nonnull resource must be primary. */
    public function resolveDefinite(string $operation, ?string $resourceId): void;

    /**
     * Keeps the operation unresolved. This method does not persist a resource
     * learned after a create operation began.
     */
    public function markUnknown(string $operationReference): void;

    /**
     * Atomically records a verified primary.create resource while keeping the
     * operation unresolved for recovery.
     */
    public function bindUnknownPrimaryCreate(
        string $operationReference,
        string $primaryResourceId
    ): void;

    /** Accepts auxiliary.create success with a nonnull auxiliary resource. */
    public function resolveAuxiliary(
        string $operationReference,
        string $auxiliaryResourceId
    ): void;
}
