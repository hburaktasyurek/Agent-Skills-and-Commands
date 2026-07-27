#!/usr/bin/env node

import fs from "node:fs";
import { createRunRecord } from "./run-record-core.mjs";

const inputPath = process.argv[2];
if (!inputPath) {
  process.stderr.write(
    "Usage: node scripts/create-run-record.mjs path/to/input.json\n",
  );
  process.exit(1);
}

try {
  const input = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  process.stdout.write(`${JSON.stringify(createRunRecord(input), null, 2)}\n`);
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : error}\n`);
  process.exit(2);
}
