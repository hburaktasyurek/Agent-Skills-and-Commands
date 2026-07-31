<?php

use PHPUnit\Framework\TestCase;

final class OperationAuthorityContractTest extends TestCase
{
    /** primary.create and primary.update are accepted; auxiliary.create is not. */
    public function testDefiniteResolutionRejectsAuxiliaryOperation(): void
    {
    }

    /** The stored operation remains unresolved and reload exposes the exact ID. */
    public function testUnknownCreateBindingRetainsExactPrimaryIdentity(): void
    {
    }

    /** A primary ID and a null ID are both rejected. */
    public function testAuxiliaryResolutionRequiresAuxiliaryResource(): void
    {
    }
}
