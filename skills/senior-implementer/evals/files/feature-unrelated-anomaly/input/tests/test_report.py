import copy
import unittest

from src.report import build_active_report


class ReportTest(unittest.TestCase):
    def test_filters_inactive_rows(self):
        rows = [
            {"id": 2, "name": "Beta", "active": False},
            {"id": 1, "name": "Alpha", "active": True},
        ]

        self.assertEqual(build_active_report(rows), [{"id": 1, "name": "Alpha"}])

    def test_does_not_mutate_rows(self):
        rows = [{"id": 1, "name": "Alpha", "active": True}]
        original = copy.deepcopy(rows)
        build_active_report(rows)
        self.assertEqual(rows, original)


if __name__ == "__main__":
    unittest.main()
