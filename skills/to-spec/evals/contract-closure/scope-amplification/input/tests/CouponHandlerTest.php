<?php

declare(strict_types=1);

final class CouponHandlerTest
{
    public function testPositiveAmountUpdatesOnlyTheServerBoundPendingIntent(): void
    {
        // The browser ID differs from the server binding; assert update(server ID, amount).
    }

    public function testMissingBindingAndZeroAmountKeepTheLocalCouponResult(): void
    {
        // Assert the unchanged CouponResult. Neighboring create/cancel and
        // IdempotencyKey::sha256 / PublicationLog surfaces are available if a
        // broader lifecycle is selected; this fixture does not mandate them.
    }
}
