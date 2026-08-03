import assert from "node:assert/strict";
import test from "node:test";

import { nextAttempt } from "../src/payment-retry.js";

test("first retry increments from zero", () => {
  assert.equal(nextAttempt(0), 1);
});

test("later retry increments the previous attempt", () => {
  assert.equal(nextAttempt(2), 3);
});
