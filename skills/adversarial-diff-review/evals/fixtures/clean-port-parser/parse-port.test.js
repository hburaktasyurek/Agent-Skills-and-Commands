const assert = require("node:assert/strict");
const test = require("node:test");
const { parsePort } = require("./parse-port");

test("accepts decimal boundaries", () => {
  assert.equal(parsePort("1"), 1);
  assert.equal(parsePort("65535"), 65535);
});

test("rejects invalid inputs", () => {
  for (const value of ["", "0", "65536", "1.5", " 80", "+80", "８０"])
    assert.throws(() => parsePort(value), RangeError);
  for (const value of [80, null, undefined])
    assert.throws(() => parsePort(value), TypeError);
});
