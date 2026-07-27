#!/usr/bin/env node

import fs from "node:fs";
import { renderGoal } from "../../goal-engineering/scripts/goal-core.mjs";
import { assessReadiness } from "./readiness-score-core.mjs";
import { READINESS_CRITERIA } from "./readiness-score-core.mjs";

const fixtureUrl = new URL(
  "../../goal-engineering/evals/valid-goal.json",
  import.meta.url,
);
const source = JSON.parse(fs.readFileSync(fixtureUrl, "utf8"));
const goalResult = renderGoal(source);

const readinessInput = {
  goal_input: source,
  goal_result: goalResult,
  readiness_answers: Object.fromEntries(
    READINESS_CRITERIA.map(({ key }) => [key, "yes"]),
  ),
  risk_level: "medium",
  mutates: true,
  repeated: true,
  broad: true,
  long_running: false,
  resumable: false,
};

const readiness = assessReadiness(readinessInput);
if (!goalResult.within_limit || readiness.verdict !== "ready") {
  throw new Error(
    `Integration failed: goal=${goalResult.character_count}/${goalResult.limit}, verdict=${readiness.verdict}`,
  );
}

process.stdout.write(
  `${JSON.stringify(
    {
      passed: true,
      methodology: source.methodology,
      generated_goal_length: goalResult.character_count,
      goal_limit: goalResult.limit,
      readiness_verdict: readiness.verdict,
      readiness_score: readiness.score,
      hard_gates: readiness.hard_gates.length,
      supervision_gates: readiness.supervision_gates.length,
    },
    null,
    2,
  )}\n`,
);
