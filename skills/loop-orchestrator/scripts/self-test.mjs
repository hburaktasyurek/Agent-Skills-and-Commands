#!/usr/bin/env node

import fs from "node:fs";
import { renderGoal } from "../../goal-engineering/scripts/goal-core.mjs";
import {
  READINESS_CRITERIA,
  assessReadiness,
} from "../../loop-readiness-score/scripts/readiness-score-core.mjs";
import { renderMethodologySkill } from "../../methodology-skill-creator/scripts/methodology-skill-core.mjs";
import {
  assertCanonicalHandoff,
  canonicalContractFrom,
  terminalHandoff,
} from "./handoff-core.mjs";

const fixtureUrl = new URL(
  "../../goal-engineering/evals/valid-goal.json",
  import.meta.url,
);
const source = JSON.parse(fs.readFileSync(fixtureUrl, "utf8"));
const contract = canonicalContractFrom(source);
const selection = {
  contract,
  selection: {
    methodology_name: "Work Breakdown Structure",
    method_ref: "references/work-breakdown-structure.md",
  },
};
const goalResult = renderGoal(source);
const allYes = Object.fromEntries(
  READINESS_CRITERIA.map(({ key }) => [key, "yes"]),
);
const readinessEnvelope = {
  goal_input: source,
  goal_result: goalResult,
  readiness_answers: allYes,
  risk_level: "medium",
  mutates: true,
  repeated: true,
  broad: true,
  long_running: false,
  resumable: false,
};
const readyReadiness = assessReadiness(readinessEnvelope);
const results = [];

const check = (name, condition, evidence) => {
  if (!condition) {
    throw new Error(`${name} failed: ${evidence}`);
  }
  results.push({ name, passed: true, evidence });
};

const preserved = assertCanonicalHandoff(contract, structuredClone(contract));
check(
  "eight-field handoff is preserved",
  preserved.preserved && preserved.fields.length === 8,
  `${preserved.fields.length} fields`,
);

const changed = structuredClone(contract);
changed.task = "Changed task";
let changedError = null;
try {
  assertCanonicalHandoff(contract, changed);
} catch (error) {
  changedError = error;
}
check(
  "changed canonical field is rejected",
  changedError instanceof Error && /changed/.test(changedError.message),
  changedError?.message || "handoff unexpectedly succeeded",
);

const noneContract = structuredClone(contract);
noneContract.methodology = "none";
const noneResult = terminalHandoff({
  intent: "loop-goal",
  canonicalContract: noneContract,
  selection: {
    contract: noneContract,
    selection: { methodology_name: "None", method_ref: "none" },
  },
});
check(
  "none stops before downstream work",
  noneResult.status === "none" && noneResult.next_owner === "human",
  `${noneResult.status}/${noneResult.next_owner}`,
);

let mismatchedNoneError = null;
try {
  terminalHandoff({
    intent: "loop-goal",
    canonicalContract: contract,
    selection: {
      contract: noneContract,
      selection: { methodology_name: "None", method_ref: "none" },
    },
  });
} catch (error) {
  mismatchedNoneError = error;
}
check(
  "none cannot hide a changed canonical contract",
  mismatchedNoneError instanceof Error &&
    /changed/.test(mismatchedNoneError.message),
  mismatchedNoneError?.message || "mismatched none unexpectedly succeeded",
);

const blockedEnvelope = structuredClone(readinessEnvelope);
blockedEnvelope.goal_input.boundaries = [];
const blockedReadiness = assessReadiness(blockedEnvelope);
const supervisedEnvelope = structuredClone(readinessEnvelope);
delete supervisedEnvelope.goal_input.independent_checker;
supervisedEnvelope.goal_result = renderGoal(supervisedEnvelope.goal_input);
supervisedEnvelope.readiness_answers.independent_checker = "no";
const supervisedReadiness = assessReadiness(supervisedEnvelope);

for (const [
  verdict,
  goalInput,
  resultArtifact,
  readinessInput,
  readinessResult,
] of [
  [
    "blocked",
    blockedEnvelope.goal_input,
    goalResult,
    blockedEnvelope,
    blockedReadiness,
  ],
  [
    "supervised",
    supervisedEnvelope.goal_input,
    supervisedEnvelope.goal_result,
    supervisedEnvelope,
    supervisedReadiness,
  ],
  ["ready", source, goalResult, readinessEnvelope, readyReadiness],
]) {
  const result = terminalHandoff({
    intent: "loop-goal",
    canonicalContract: contract,
    selection,
    goalInput,
    goalResult: resultArtifact,
    readinessInput,
    readinessResult,
  });
  const failedGateCount =
    result.failed_hard_gates.length +
    result.failed_supervision_gates.length;
  check(
    `${verdict} readiness is not upgraded`,
    result.status === verdict &&
      result.next_owner === "human" &&
      result.artifact.goal_result === resultArtifact &&
      result.artifact.readiness_result === readinessResult &&
      result.recommended_next_correction ===
        readinessResult.recommended_next_correction &&
      (verdict === "ready"
        ? failedGateCount === 0
        : failedGateCount > 0),
    `${result.status}/${result.next_owner}; failed_gates=${failedGateCount}; correction=${result.recommended_next_correction}`,
  );
}

let missingGoalError = null;
try {
  terminalHandoff({
    intent: "loop-goal",
    canonicalContract: contract,
    selection,
    goalInput: source,
    readinessInput: readinessEnvelope,
    readinessResult: readyReadiness,
  });
} catch (error) {
  missingGoalError = error;
}
check(
  "ready cannot hide a missing goal artifact",
  missingGoalError instanceof Error && /goal artifact/.test(missingGoalError.message),
  missingGoalError?.message || "missing goal unexpectedly accepted",
);

const mismatchedGoal = structuredClone(goalResult);
mismatchedGoal.goal = mismatchedGoal.goal.replace(
  "Methodology: work-breakdown-structure",
  "Methodology: five-whys",
);
mismatchedGoal.character_count = Array.from(mismatchedGoal.goal).length;
let mismatchedGoalError = null;
try {
  terminalHandoff({
    intent: "loop-goal",
    canonicalContract: contract,
    selection,
    goalInput: source,
    goalResult: mismatchedGoal,
    readinessInput: readinessEnvelope,
    readinessResult: readyReadiness,
  });
} catch (error) {
  mismatchedGoalError = error;
}
check(
  "goal artifact methodology must match selector",
  mismatchedGoalError instanceof Error &&
    /methodology-mismatched/.test(mismatchedGoalError.message),
  mismatchedGoalError?.message ||
    "mismatched goal artifact unexpectedly accepted",
);

const detachedGoal = structuredClone(goalResult);
detachedGoal.goal = detachedGoal.goal.replace(
  `/goal ${source.task}`,
  "/goal Publish an unrelated unreviewed artifact.",
);
detachedGoal.character_count = Array.from(detachedGoal.goal).length;
detachedGoal.within_limit =
  detachedGoal.character_count <= detachedGoal.limit;
let detachedGoalError = null;
try {
  terminalHandoff({
    intent: "loop-goal",
    canonicalContract: contract,
    selection,
    goalInput: source,
    goalResult: detachedGoal,
    readinessInput: readinessEnvelope,
    readinessResult: readyReadiness,
  });
} catch (error) {
  detachedGoalError = error;
}
check(
  "readiness evidence must assess the exact returned goal",
  detachedGoalError instanceof Error &&
    /fresh assessment of this goal/.test(detachedGoalError.message),
  detachedGoalError?.message ||
    "detached readiness evidence unexpectedly accepted",
);

const changedGoalInput = structuredClone(source);
changedGoalInput.task = "Changed downstream task";
let changedGoalInputError = null;
try {
  terminalHandoff({
    intent: "loop-goal",
    canonicalContract: contract,
    selection,
    goalInput: changedGoalInput,
    goalResult,
    readinessInput: readinessEnvelope,
    readinessResult: readyReadiness,
  });
} catch (error) {
  changedGoalInputError = error;
}
check(
  "goal control input cannot rewrite the canonical contract",
  changedGoalInputError instanceof Error &&
    /changed/.test(changedGoalInputError.message),
  changedGoalInputError?.message ||
    "changed goal input unexpectedly accepted",
);

const forgedReadiness = structuredClone(readyReadiness);
forgedReadiness.hard_gates[0].passed = false;
let forgedReadinessError = null;
try {
  terminalHandoff({
    intent: "loop-goal",
    canonicalContract: contract,
    selection,
    goalInput: source,
    goalResult,
    readinessInput: readinessEnvelope,
    readinessResult: forgedReadiness,
  });
} catch (error) {
  forgedReadinessError = error;
}
check(
  "ready cannot contradict failed readiness gates",
  forgedReadinessError instanceof Error &&
    /fresh assessment|conflicts/.test(forgedReadinessError.message),
  forgedReadinessError?.message || "forged readiness unexpectedly accepted",
);

const forgedScore = structuredClone(readyReadiness);
forgedScore.score = 99;
let forgedScoreError = null;
try {
  terminalHandoff({
    intent: "loop-goal",
    canonicalContract: contract,
    selection,
    goalInput: source,
    goalResult,
    readinessInput: readinessEnvelope,
    readinessResult: forgedScore,
  });
} catch (error) {
  forgedScoreError = error;
}
check(
  "readiness score must match criterion evidence",
  forgedScoreError instanceof Error &&
    /fresh assessment|internally forged/.test(forgedScoreError.message),
  forgedScoreError?.message || "forged score unexpectedly accepted",
);

const creatorArtifact = renderMethodologySkill({
  skill_name: "bounded-method-skill",
  contract,
  selection: {
    methodology_name: selection.selection.methodology_name,
    method_ref: selection.selection.method_ref,
  },
});
const creatorResult = terminalHandoff({
  intent: "methodology-skill",
  canonicalContract: contract,
  selection,
  creatorResult: creatorArtifact,
});
check(
  "creator output requires review",
  creatorResult.status === "review-required" &&
    creatorResult.next_owner === "human",
  `${creatorResult.status}/${creatorResult.next_owner}`,
);

const mismatchedCreator = structuredClone(creatorArtifact);
mismatchedCreator.methodology = "five-whys";
let mismatchedCreatorError = null;
try {
  terminalHandoff({
    intent: "methodology-skill",
    canonicalContract: contract,
    selection,
    creatorResult: mismatchedCreator,
  });
} catch (error) {
  mismatchedCreatorError = error;
}
check(
  "creator artifact methodology must match selector",
  mismatchedCreatorError instanceof Error &&
    /methodology-mismatched/.test(mismatchedCreatorError.message),
  mismatchedCreatorError?.message ||
    "mismatched creator artifact unexpectedly accepted",
);

const incompleteCreator = structuredClone(creatorArtifact);
delete incompleteCreator.checks.canonical_method_sections_present;
let incompleteCreatorError = null;
try {
  terminalHandoff({
    intent: "methodology-skill",
    canonicalContract: contract,
    selection,
    creatorResult: incompleteCreator,
  });
} catch (error) {
  incompleteCreatorError = error;
}
check(
  "creator artifact requires the complete check set",
  incompleteCreatorError instanceof Error &&
    /creator artifact/.test(incompleteCreatorError.message),
  incompleteCreatorError?.message ||
    "incomplete creator checks unexpectedly accepted",
);

process.stdout.write(
  `${JSON.stringify({ passed: results.length, results }, null, 2)}\n`,
);
