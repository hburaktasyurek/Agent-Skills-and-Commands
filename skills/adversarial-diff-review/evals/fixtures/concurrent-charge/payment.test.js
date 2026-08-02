const assert = require("node:assert/strict");
const test = require("node:test");
const { claim } = require("./payment");

test("repeated key charges once", async () => {
  let calls = 0;
  const charge = async () => ++calls;

  const first = await claim("order-7", charge);
  const second = await claim("order-7", charge);

  assert.equal(first.duplicate, false);
  assert.equal(second.duplicate, true);
  assert.equal(calls, 1);
});
