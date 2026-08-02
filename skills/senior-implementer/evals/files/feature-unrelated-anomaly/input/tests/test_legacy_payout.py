import unittest

from src.legacy_payout import payout_amount


class LegacyPayoutTest(unittest.TestCase):
    def test_applies_fractional_share_to_balance(self):
        self.assertEqual(payout_amount(10_000, 0.5), 5_000)


if __name__ == "__main__":
    unittest.main()
