#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { renderGoal } from "../../goal-engineering/scripts/goal-core.mjs";
import {
  READINESS_CRITERIA,
  assessReadiness,
} from "../../loop-readiness-score/scripts/readiness-score-core.mjs";
import { createRunRecord } from "./run-record-core.mjs";

const goalInput = JSON.parse(
  fs.readFileSync(
    new URL("../../goal-engineering/evals/valid-goal.json", import.meta.url),
    "utf8",
  ),
);
const observationFixture = JSON.parse(
  fs.readFileSync(
    new URL("../evals/valid-run-record.json", import.meta.url),
    "utf8",
  ),
).observation;
const goalResult = renderGoal(goalInput);
const readinessInput = {
  readiness_answers: Object.fromEntries(
    READINESS_CRITERIA.map(({ key }) => [key, "yes"]),
  ),
  risk_level: "medium",
  mutates: true,
  repeated: true,
  broad: true,
  long_running: false,
  resumable: false,
  scheduled: false,
};
const fullReadinessInput = {
  ...readinessInput,
  goal_input: goalInput,
  goal_result: goalResult,
};
const readinessResult = assessReadiness(fullReadinessInput);
const base = {
  goal_input: goalInput,
  goal_result: goalResult,
  readiness_input: readinessInput,
  readiness_result: readinessResult,
  observation: observationFixture,
};

const results = [];
const check = (name, condition, evidence) => {
  if (!condition) throw new Error(`${name} failed: ${evidence}`);
  results.push({ name, passed: true, evidence });
};
const expectFailure = (name, candidate, pattern) => {
  let error = null;
  try {
    createRunRecord(candidate);
  } catch (caught) {
    error = caught;
  }
  check(
    name,
    error instanceof Error && pattern.test(error.message),
    error?.message || "record unexpectedly succeeded",
  );
};

const valid = createRunRecord(base);
check(
  "ready external evidence becomes a review-required yes record",
  valid.result === "yes" &&
    valid.status === "review-required" &&
    valid.assessment_id === readinessResult.assessment_id &&
    valid.actual_evidence.length === goalInput.validation.checks.length,
  `${valid.result}/${valid.status}/${valid.assessment_id}`,
);
check(
  "record identity is deterministic",
  createRunRecord(structuredClone(base)).record_id === valid.record_id,
  valid.record_id,
);

const partial = structuredClone(base);
partial.observation.check_results[1].status = "partial";
check(
  "one partial and no failures derives partial",
  createRunRecord(partial).result === "partial",
  createRunRecord(partial).result,
);

const failed = structuredClone(base);
failed.observation.check_results[2].status = "fail";
check(
  "one failure derives no",
  createRunRecord(failed).result === "no",
  createRunRecord(failed).result,
);

const staleReadiness = structuredClone(base);
staleReadiness.readiness_result.score = 99;
expectFailure(
  "stale readiness result is rejected",
  staleReadiness,
  /stale, forged, or detached/,
);

const staleEmbeddedGoal = structuredClone(base);
staleEmbeddedGoal.readiness_input.goal_input = {
  ...goalInput,
  task: "different",
};
expectFailure(
  "stale embedded goal copy is rejected",
  staleEmbeddedGoal,
  /goal_input is stale or detached/,
);

const forgedGoalMetadata = structuredClone(base);
forgedGoalMetadata.goal_result.target_tool = "FORGED";
forgedGoalMetadata.goal_result.omitted_optional_fields = ["validation"];
forgedGoalMetadata.readiness_result = assessReadiness({
  ...forgedGoalMetadata.readiness_input,
  goal_input: forgedGoalMetadata.goal_input,
  goal_result: forgedGoalMetadata.goal_result,
});
expectFailure(
  "forged renderer metadata cannot produce a run record",
  forgedGoalMetadata,
  /require readiness verdict ready; received blocked/,
);

const supervised = structuredClone(base);
supervised.readiness_input.readiness_answers = Object.fromEntries(
  READINESS_CRITERIA.map(({ key }) => [key, "partial"]),
);
supervised.readiness_result = assessReadiness({
  ...supervised.readiness_input,
  goal_input: supervised.goal_input,
  goal_result: supervised.goal_result,
});
expectFailure(
  "supervised readiness cannot create a record",
  supervised,
  /require readiness verdict ready; received supervised/,
);

const blocked = structuredClone(base);
delete blocked.readiness_input.scheduled;
blocked.readiness_result = assessReadiness({
  ...blocked.readiness_input,
  goal_input: blocked.goal_input,
  goal_result: blocked.goal_result,
});
expectFailure(
  "blocked readiness cannot create a record",
  blocked,
  /require readiness verdict ready; received blocked/,
);

const missingCheck = structuredClone(base);
missingCheck.observation.check_results.pop();
expectFailure(
  "missing check result is rejected",
  missingCheck,
  /must contain exactly/,
);

const reorderedChecks = structuredClone(base);
reorderedChecks.observation.check_results.reverse();
expectFailure(
  "reordered checks are rejected",
  reorderedChecks,
  /must exactly match/,
);

const emptyEvidence = structuredClone(base);
emptyEvidence.observation.check_results[0].evidence = [];
expectFailure(
  "empty actual evidence is rejected",
  emptyEvidence,
  /must be a non-empty string list/,
);

const hypothesisNotApplicable = structuredClone(base);
hypothesisNotApplicable.observation.hypothesis_outcome = "not-applicable";
expectFailure(
  "declared hypothesis cannot be marked not-applicable",
  hypothesisNotApplicable,
  /cannot be not-applicable/,
);

const noHypothesis = structuredClone(base);
delete noHypothesis.goal_input.hypothesis;
noHypothesis.goal_result = renderGoal(noHypothesis.goal_input);
noHypothesis.readiness_input.readiness_answers.hypothesis = "no";
noHypothesis.readiness_result = assessReadiness({
  ...noHypothesis.readiness_input,
  goal_input: noHypothesis.goal_input,
  goal_result: noHypothesis.goal_result,
});
noHypothesis.observation.hypothesis_outcome = "not-applicable";
check(
  "goal without hypothesis requires not-applicable",
  createRunRecord(noHypothesis).hypothesis_outcome === "not-applicable",
  "not-applicable",
);

const invalidNextAction = structuredClone(base);
invalidNextAction.observation.next_action = "retry";
expectFailure(
  "implicit retry is rejected",
  invalidNextAction,
  /must be stop, adjust, or human-action/,
);

const missingHumanReturn = structuredClone(base);
missingHumanReturn.observation.human_return_reason = "";
expectFailure(
  "missing human-return reason is rejected",
  missingHumanReturn,
  /human_return_reason must be a non-empty string/,
);

const cliDirectory = fs.mkdtempSync(
  path.join(os.tmpdir(), "loop-run-record-test-"),
);
try {
  const validPath = path.join(cliDirectory, "valid.json");
  fs.writeFileSync(validPath, JSON.stringify(base));
  const validCli = spawnSync(
    process.execPath,
    [new URL("./create-run-record.mjs", import.meta.url).pathname, validPath],
    { encoding: "utf8" },
  );
  check(
    "CLI emits a valid record and exits zero",
    validCli.status === 0 &&
      JSON.parse(validCli.stdout).status === "review-required",
    `exit=${validCli.status}`,
  );

  const invalidPath = path.join(cliDirectory, "invalid.json");
  fs.writeFileSync(invalidPath, JSON.stringify(invalidNextAction));
  const invalidCli = spawnSync(
    process.execPath,
    [new URL("./create-run-record.mjs", import.meta.url).pathname, invalidPath],
    { encoding: "utf8" },
  );
  check(
    "CLI validation failure exits two",
    invalidCli.status === 2 && /next_action/.test(invalidCli.stderr),
    `exit=${invalidCli.status}; ${invalidCli.stderr.trim()}`,
  );
} finally {
  fs.rmSync(cliDirectory, { recursive: true, force: true });
}

process.stdout.write(`${JSON.stringify({ passed: results.length, results }, null, 2)}\n`);
