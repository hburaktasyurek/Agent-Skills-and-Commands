import assert from "node:assert/strict";
import test from "node:test";
import { payout } from "../src/legacy-payout.mjs";

test("legacy payout preserves cents", () => {
  assert.equal(payout(25), 25);
});
