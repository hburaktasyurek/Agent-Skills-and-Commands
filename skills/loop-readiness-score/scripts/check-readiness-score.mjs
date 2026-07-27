#!/usr/bin/env node

import fs from "node:fs";
import { assessReadiness } from "./readiness-score-core.mjs";

const inputPath = process.argv[2];

try {
  const raw = fs.readFileSync(inputPath || 0, "utf8");
  const result = assessReadiness(JSON.parse(raw));
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (result.verdict === "blocked") {
    process.exitCode = 2;
  } else if (result.verdict === "supervised") {
    process.exitCode = 3;
  }
} catch (error) {
  process.stderr.write(
    `${JSON.stringify({ error: error.message }, null, 2)}\n`,
  );
  process.exitCode = 1;
}
