#!/usr/bin/env node

import fs from "node:fs";
import { renderGoal } from "./goal-core.mjs";

const inputPath = process.argv[2];

try {
  const raw = fs.readFileSync(inputPath || 0, "utf8");
  const result = renderGoal(JSON.parse(raw));
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.within_limit) {
    process.exitCode = 2;
  }
} catch (error) {
  process.stderr.write(
    `${JSON.stringify({ error: error.message }, null, 2)}\n`,
  );
  process.exitCode = 1;
}

