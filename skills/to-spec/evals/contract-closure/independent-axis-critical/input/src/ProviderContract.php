<?php

/**
 * DefiniteFailureSignal is a primary-operation protocol signal. Pairing it
 * with auxiliary.create is invalid input and must fail before an outcome is
 * returned; it is not auxiliary success and must not resolve that operation.
 */
final class DefiniteFailureSignal extends RuntimeException
{
}

/**
 * AmbiguousSignal may occur for any operation. It may carry a provider object.
 * When a primary.create signal carries a verified primary resource, recovery
 * must retain that exact identity across the process boundary.
 */
final class AmbiguousSignal extends RuntimeException
{
    public function __construct(
        private PrimaryResource|AuxiliaryResource|null $object = null
    ) {
        parent::__construct('Ambiguous provider result');
    }

    /** Returns null or the verified provider object embedded by the SDK. */
    public function providerObject(): PrimaryResource|AuxiliaryResource|null
    {
        return $this->object;
    }
}

/** PrimaryResource objects are valid only for primary.* lookups. */
final class PrimaryResource
{
    public function __construct(private string $id)
    {
    }

    public function id(): string
    {
        return $this->id;
    }
}

/** AuxiliaryResource objects are valid only for auxiliary.create lookups. */
final class AuxiliaryResource
{
    public function __construct(private string $id)
    {
    }

    public function id(): string
    {
        return $this->id;
    }
}
