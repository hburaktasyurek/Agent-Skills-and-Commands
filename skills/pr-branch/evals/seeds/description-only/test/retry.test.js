import assert from "node:assert/strict";
import test from "node:test";
import {scheduleRetry} from "../src/retry.js";

test("schedules the first retry", () => {
  assert.equal(scheduleRetry({retryScheduled: false}).retryScheduled, true);
});
