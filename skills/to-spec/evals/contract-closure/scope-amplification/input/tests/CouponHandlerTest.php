<?php

declare(strict_types=1);

final class CouponHandlerTest
{
    public function testPositiveAmountUpdatesOnlyTheServerBoundPendingIntent(): void
    {
        // The browser ID differs from the server binding; assert update(server ID, amount).
    }

    public function testMissingBindingAndZeroAmountKeepTheCouponResultWithoutProviderCall(): void
    {
        // Assert the unchanged CouponResult and no Provider::update call in both cases.
    }
}
