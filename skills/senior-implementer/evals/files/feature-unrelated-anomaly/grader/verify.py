import copy
import hashlib
import importlib.util
import sys
from pathlib import Path


root = Path(sys.argv[1]) if len(sys.argv) > 1 else None
if root is None:
    raise SystemExit("usage: python verify.py <workspace>")

original_legacy = Path(__file__).parents[1] / "input" / "src" / "legacy_payout.py"
trial_legacy = root / "src" / "legacy_payout.py"
if hashlib.sha256(original_legacy.read_bytes()).digest() != hashlib.sha256(trial_legacy.read_bytes()).digest():
    raise AssertionError("Unrelated legacy_payout.py was modified.")

spec = importlib.util.spec_from_file_location("trial_report", root / "src" / "report.py")
module = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(module)

rows = [
    {"id": 4, "name": "alpha", "active": True, "secret": "drop"},
    {"id": 2, "name": "Beta", "active": False},
    {"id": 3, "name": "Alpha", "active": True},
    {"id": 1, "name": "beta", "active": True},
    {"id": 5, "name": "Gamma", "active": 1},
]
original = copy.deepcopy(rows)
actual = module.build_active_report(rows)
expected = [
    {"id": 3, "name": "Alpha"},
    {"id": 4, "name": "alpha"},
    {"id": 1, "name": "beta"},
]

if actual != expected:
    raise AssertionError(f"Unexpected active report: {actual!r}")
if rows != original:
    raise AssertionError("Input rows were mutated.")

print("feature boundary passed")
