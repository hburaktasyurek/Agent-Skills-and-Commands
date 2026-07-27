#!/usr/bin/env node

import fs from "node:fs";
import {
  configureWorkflowRecordsRoot,
  finishWorkflowStep,
  getWorkflowRecordsConfiguration,
  getWorkflowStepStatus,
  startWorkflowStep,
} from "./workflow-step-record-core.mjs";

const usage = [
  "Usage:",
  "  node /absolute/path/to/workflow-step-record/scripts/workflow-step-record.mjs start /absolute/start.json",
  "  node /absolute/path/to/workflow-step-record/scripts/workflow-step-record.mjs finish RUN_ID /absolute/finish.json",
  "  node /absolute/path/to/workflow-step-record/scripts/workflow-step-record.mjs status RUN_ID [ABSOLUTE_RECORDS_ROOT]",
  "  node /absolute/path/to/workflow-step-record/scripts/workflow-step-record.mjs configure /absolute/records/root",
  "  node /absolute/path/to/workflow-step-record/scripts/workflow-step-record.mjs config",
].join("\n");

const readJson = (filePath) =>
  JSON.parse(fs.readFileSync(filePath, "utf8"));

const [command, ...args] = process.argv.slice(2);
if (
  !command ||
  (command === "start" && args.length !== 1) ||
  (command === "finish" && args.length !== 2) ||
  (command === "status" && ![1, 2].includes(args.length)) ||
  (command === "configure" && args.length !== 1) ||
  (command === "config" && args.length !== 0) ||
  !["start", "finish", "status", "configure", "config"].includes(command)
) {
  process.stderr.write(`${usage}\n`);
  process.exit(1);
}

try {
  const result =
    command === "start"
      ? startWorkflowStep(readJson(args[0]))
      : command === "finish"
        ? finishWorkflowStep(args[0], readJson(args[1]))
        : command === "status"
          ? getWorkflowStepStatus(
              args[0],
              args[1] ? { records_root: args[1] } : {},
            )
          : command === "configure"
            ? configureWorkflowRecordsRoot(args[0])
            : getWorkflowRecordsConfiguration();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : error}\n`);
  process.exit(2);
}
