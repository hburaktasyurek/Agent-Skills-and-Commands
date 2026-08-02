const { parsePort } = require("./parse-port");

function configuredPort(env) {
  return env.PORT === undefined ? 3000 : parsePort(env.PORT);
}

module.exports = { configuredPort };
