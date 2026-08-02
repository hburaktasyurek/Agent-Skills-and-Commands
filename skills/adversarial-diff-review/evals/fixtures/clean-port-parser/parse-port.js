function parsePort(value) {
  if (typeof value !== "string") throw new TypeError("port must be a string");
  if (!/^[0-9]+$/.test(value)) throw new RangeError("invalid port");

  const port = Number(value);
  if (port < 1 || port > 65535) throw new RangeError("invalid port");
  return port;
}

module.exports = { parsePort };
