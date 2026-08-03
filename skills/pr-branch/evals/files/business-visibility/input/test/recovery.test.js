import assert from "node:assert/strict";
import test from "node:test";
import {retryForCustomer} from "../src/customer-retry.js";
import {recoverFromImport} from "../src/reconcile-import.js";
import {recoverFromSchedule} from "../src/scheduled-worker.js";
import {recoverFromSupport} from "../src/support-cli.js";

const callers = [
  ["customer", retryForCustomer],
  ["schedule", recoverFromSchedule],
  ["support", recoverFromSupport],
  ["reconciliation", recoverFromImport],
];

for (const [source, recover] of callers) {
  test(`${source} accepts an unclaimed recovery`, () => {
    const result = recover({claimToken: null}, "token-1");
    assert.equal(result.accepted, true);
    assert.equal(result.state.claimToken, "token-1");
    assert.equal(result.audit.outcome, "accepted");
  });
}

test("an existing claim rejects another recovery", () => {
  const state = {claimToken: "token-1"};
  const result = recoverFromSchedule(state, "token-2");
  assert.equal(result.accepted, false);
  assert.equal(result.state, state);
});

test("a rejection records the route for support", () => {
  const result = recoverFromSupport({claimToken: "token-1"}, "token-2");
  assert.deepEqual(result.audit, {source: "support", outcome: "already_claimed"});
});
