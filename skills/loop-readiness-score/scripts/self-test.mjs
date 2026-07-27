#!/usr/bin/env node

import fs from "node:fs";
import { renderGoal } from "../../goal-engineering/scripts/goal-core.mjs";
import {
  MAX_SCORE,
  READINESS_CRITERIA,
  assessReadiness,
  scoreBand,
} from "./readiness-score-core.mjs";

const fixtureUrl = new URL(
  "../../goal-engineering/evals/valid-goal.json",
  import.meta.url,
);
const goalInput = JSON.parse(fs.readFileSync(fixtureUrl, "utf8"));
const answers = Object.fromEntries(
  READINESS_CRITERIA.map(({ key }) => [key, "yes"]),
);
const readyInput = {
  goal_input: goalInput,
  goal_result: renderGoal(goalInput),
  readiness_answers: answers,
  risk_level: "medium",
  mutates: true,
  repeated: true,
  broad: true,
  long_running: false,
  resumable: false,
};

const results = [];
const check = (name, condition, evidence) => {
  if (!condition) {
    throw new Error(`${name} failed: ${evidence}`);
  }
  results.push({ name, passed: true, evidence });
};

const ready = assessReadiness(readyInput);
check(
  "eleven weights total 100",
  READINESS_CRITERIA.length === 11 && MAX_SCORE === 100,
  `${READINESS_CRITERIA.length} criteria/${MAX_SCORE}`,
);
check(
  "all yes scores 100 and is ready",
  ready.score === 100 &&
    ready.score_band === "Strong loop candidate" &&
    ready.verdict === "ready",
  `${ready.score}/${ready.max_score} ${ready.score_band} ${ready.verdict}`,
);

const hardGateCases = [
  {
    gate: "readiness answer completeness",
    mutate(candidate) {
      delete candidate.readiness_answers.hypothesis;
    },
  },
  {
    gate: "readiness answer evidence",
    mutate(candidate) {
      delete candidate.goal_input.hypothesis;
    },
  },
  {
    gate: "specific task outcome",
    mutate(candidate) {
      candidate.goal_input.task = "";
    },
  },
  {
    gate: "validation checks",
    mutate(candidate) {
      candidate.goal_input.validation.checks = [];
    },
  },
  {
    gate: "validation evidence",
    mutate(candidate) {
      candidate.goal_input.validation.evidence = [];
    },
  },
  {
    gate: "boundaries",
    mutate(candidate) {
      candidate.goal_input.boundaries = [];
    },
  },
  {
    gate: "stop conditions",
    mutate(candidate) {
      candidate.goal_input.human_review_stop.stop_conditions = [];
    },
  },
  {
    gate: "fallback",
    mutate(candidate) {
      candidate.goal_input.fallback = "";
    },
  },
  {
    gate: "goal integrity and character limit",
    mutate(candidate) {
      candidate.goal_result.goal = "X".repeat(4001);
      candidate.goal_result.character_count = 4001;
      candidate.goal_result.limit = 4000;
      candidate.goal_result.within_limit = false;
    },
  },
  {
    gate: "goal semantic integrity",
    mutate(candidate) {
      candidate.goal_result.goal = "/goal altered";
      candidate.goal_result.character_count = Array.from(
        candidate.goal_result.goal,
      ).length;
    },
  },
  {
    gate: "risk declaration",
    mutate(candidate) {
      delete candidate.risk_level;
    },
  },
  {
    gate: "applicability declarations",
    mutate(candidate) {
      delete candidate.mutates;
    },
  },
  {
    gate: "human approval declaration",
    mutate(candidate) {
      delete candidate.goal_input.human_review_stop.human_approval_required;
    },
  },
  {
    gate: "required human approval",
    mutate(candidate) {
      candidate.goal_input.human_review_stop.approval_actions = [];
    },
  },
];

for (const hardGateCase of hardGateCases) {
  const candidate = structuredClone(readyInput);
  hardGateCase.mutate(candidate);
  const result = assessReadiness(candidate);
  const gateResult = result.hard_gates.find(
    ({ name }) => name === hardGateCase.gate,
  );
  check(
    `${hardGateCase.gate} independently overrides an otherwise passing score`,
    result.score >= 80 &&
      result.verdict === "blocked" &&
      gateResult?.passed === false,
    `${result.score}/${result.max_score} ${result.verdict}; ${gateResult?.evidence}`,
  );
}

const partialInput = structuredClone(readyInput);
partialInput.readiness_answers = Object.fromEntries(
  READINESS_CRITERIA.map(({ key }) => [key, "partial"]),
);
const partial = assessReadiness(partialInput);
check(
  "all partial scores 50 and requires supervision",
  partial.score === 50 &&
    partial.score_band === "Manual supervision required" &&
    partial.verdict === "supervised",
  `${partial.score}/${partial.max_score} ${partial.verdict}`,
);

const noInput = structuredClone(readyInput);
noInput.readiness_answers = Object.fromEntries(
  READINESS_CRITERIA.map(({ key }) => [key, "no"]),
);
const noResult = assessReadiness(noInput);
check(
  "all no scores zero and is not ready",
  noResult.score === 0 &&
    noResult.score_band === "Not ready" &&
    noResult.verdict === "supervised",
  `${noResult.score}/${noResult.max_score} ${noResult.verdict}`,
);

for (const [score, expected] of [
  [39, "Not ready"],
  [40, "Manual supervision required"],
  [59, "Manual supervision required"],
  [60, "Semi-autonomous loop candidate"],
  [79, "Semi-autonomous loop candidate"],
  [80, "Strong loop candidate"],
]) {
  check(
    `score band boundary ${score}`,
    scoreBand(score) === expected,
    `${score} => ${scoreBand(score)}`,
  );
}

const oddPartialInput = structuredClone(noInput);
oddPartialInput.readiness_answers.rollback_strategy = "partial";
const oddPartial = assessReadiness(oddPartialInput);
check(
  "a half of a seven-point criterion rounds from 3.5 to 4",
  oddPartial.criteria.find(({ key }) => key === "rollback_strategy")
    ?.earned === 3.5 && oddPartial.score === 4,
  `earned=3.5, score=${oddPartial.score}`,
);

const roundsToStrongInput = structuredClone(readyInput);
roundsToStrongInput.readiness_answers.boundaries = "no";
roundsToStrongInput.readiness_answers.rollback_strategy = "no";
roundsToStrongInput.readiness_answers.human_approval_gate = "partial";
const roundsToStrong = assessReadiness(roundsToStrongInput);
const roundsToStrongRaw = roundsToStrong.criteria.reduce(
  (sum, criterion) => sum + criterion.earned,
  0,
);
check(
  "79.5 rounds to 80, strong, and ready",
  roundsToStrongRaw === 79.5 &&
    roundsToStrong.score === 80 &&
    roundsToStrong.score_band === "Strong loop candidate" &&
    roundsToStrong.verdict === "ready",
  `raw=${roundsToStrongRaw}, score=${roundsToStrong.score}, band=${roundsToStrong.score_band}, verdict=${roundsToStrong.verdict}`,
);

const correctionInput = structuredClone(readyInput);
correctionInput.readiness_answers.validation = "no";
const correction = assessReadiness(correctionInput);
check(
  "weakest criterion drives recommended correction",
  correction.recommended_next_correction.includes("Validation"),
  correction.recommended_next_correction,
);

for (const field of ["validation", "boundaries", "human_review_stop"]) {
  const candidate = structuredClone(readyInput);
  if (field === "validation") {
    candidate.goal_input.validation.checks = [];
  } else if (field === "boundaries") {
    candidate.goal_input.boundaries = [];
  } else {
    candidate.goal_input.human_review_stop.stop_conditions = [];
  }
  const result = assessReadiness(candidate);
  check(`${field} hard gate blocks`, result.verdict === "blocked", result.verdict);
}

const unsupportedHypothesis = structuredClone(readyInput);
delete unsupportedHypothesis.goal_input.hypothesis;
unsupportedHypothesis.goal_result = renderGoal(unsupportedHypothesis.goal_input);
const unsupportedHypothesisResult = assessReadiness(unsupportedHypothesis);
check(
  "positive answer without source evidence blocks",
  unsupportedHypothesisResult.verdict === "blocked",
  unsupportedHypothesisResult.verdict,
);

const overLimit = structuredClone(readyInput);
overLimit.goal_result.goal = "X".repeat(4001);
overLimit.goal_result.character_count = 4001;
overLimit.goal_result.limit = 5000;
overLimit.goal_result.within_limit = true;
const overLimitResult = assessReadiness(overLimit);
check(
  "over-limit goal blocks",
  overLimitResult.verdict === "blocked",
  overLimitResult.verdict,
);

const forgedCount = structuredClone(readyInput);
forgedCount.goal_result.goal = "X".repeat(4500);
forgedCount.goal_result.character_count = 1;
forgedCount.goal_result.limit = 4000;
forgedCount.goal_result.within_limit = true;
const forgedCountResult = assessReadiness(forgedCount);
check(
  "forged character evidence blocks",
  forgedCountResult.verdict === "blocked",
  forgedCountResult.verdict,
);

const missingApproval = structuredClone(readyInput);
delete missingApproval.goal_input.human_review_stop.human_approval_required;
const missingApprovalResult = assessReadiness(missingApproval);
check(
  "missing approval declaration blocks",
  missingApprovalResult.verdict === "blocked",
  missingApprovalResult.verdict,
);

const missingApplicability = structuredClone(readyInput);
delete missingApplicability.mutates;
const missingApplicabilityResult = assessReadiness(missingApplicability);
check(
  "missing applicability declaration blocks",
  missingApplicabilityResult.verdict === "blocked",
  missingApplicabilityResult.verdict,
);

const missingRisk = structuredClone(readyInput);
delete missingRisk.risk_level;
const missingRiskResult = assessReadiness(missingRisk);
check(
  "missing risk declaration blocks",
  missingRiskResult.verdict === "blocked",
  missingRiskResult.verdict,
);

const semanticForgery = structuredClone(readyInput);
semanticForgery.goal_result.goal = "/goal T";
semanticForgery.goal_result.character_count = Array.from(
  semanticForgery.goal_result.goal,
).length;
semanticForgery.goal_result.within_limit = true;
const semanticForgeryResult = assessReadiness(semanticForgery);
check(
  "semantically incomplete goal blocks",
  semanticForgeryResult.verdict === "blocked",
  semanticForgeryResult.verdict,
);

const noChecker = structuredClone(readyInput);
delete noChecker.goal_input.independent_checker;
noChecker.goal_result = renderGoal(noChecker.goal_input);
noChecker.readiness_answers.independent_checker = "no";
const noCheckerResult = assessReadiness(noChecker);
check(
  "missing applicable checker requires supervision",
  noCheckerResult.verdict === "supervised",
  `${noCheckerResult.score}/${noCheckerResult.max_score} ${noCheckerResult.verdict}`,
);

process.stdout.write(
  `${JSON.stringify({ passed: results.length, results }, null, 2)}\n`,
);
