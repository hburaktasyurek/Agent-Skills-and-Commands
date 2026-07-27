import { renderGoal } from "../../goal-engineering/scripts/goal-core.mjs";

const COMMON_GOAL_LIMIT = 4000;
const ANSWER_FACTOR = { no: 0, partial: 0.5, yes: 1 };

export const READINESS_CRITERIA = [
  { key: "hypothesis", label: "Hypothesis", weight: 8 },
  { key: "smallest_useful_run", label: "Smallest useful run", weight: 8 },
  { key: "goal_clarity", label: "Goal clarity", weight: 10 },
  { key: "validation", label: "Validation", weight: 14 },
  { key: "independent_checker", label: "Independent checker", weight: 12 },
  { key: "boundaries", label: "Boundaries", weight: 10 },
  { key: "stop_condition", label: "Stop condition", weight: 10 },
  { key: "budget_limit", label: "Budget limit", weight: 8 },
  { key: "rollback_strategy", label: "Rollback strategy", weight: 7 },
  { key: "sandbox_isolation", label: "Sandbox isolation", weight: 6 },
  { key: "human_approval_gate", label: "Human approval gate", weight: 7 },
];

export const MAX_SCORE = READINESS_CRITERIA.reduce(
  (sum, criterion) => sum + criterion.weight,
  0,
);

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const hasNonEmptyStringArray = (value) =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.every((item) => isNonEmptyString(item));

const gate = (name, passed, evidence) => ({ name, passed, evidence });
const countCharacters = (text) => Array.from(text).length;

export const scoreBand = (score) => {
  if (score < 40) return "Not ready";
  if (score < 60) return "Manual supervision required";
  if (score < 80) return "Semi-autonomous loop candidate";
  return "Strong loop candidate";
};

const criterionEvidence = (source) => ({
  hypothesis: isNonEmptyString(source.hypothesis),
  smallest_useful_run: isNonEmptyString(source.smallest_useful_run),
  goal_clarity: isNonEmptyString(source.task),
  validation:
    hasNonEmptyStringArray(source.validation?.checks) &&
    hasNonEmptyStringArray(source.validation?.evidence),
  independent_checker: isNonEmptyString(source.independent_checker),
  boundaries: hasNonEmptyStringArray(source.boundaries),
  stop_condition: hasNonEmptyStringArray(
    source.human_review_stop?.stop_conditions,
  ),
  budget_limit: isNonEmptyString(source.budget),
  rollback_strategy: isNonEmptyString(source.fallback),
  sandbox_isolation: isNonEmptyString(source.isolation),
  human_approval_gate:
    source.human_review_stop?.human_approval_required === true &&
    hasNonEmptyStringArray(source.human_review_stop?.approval_actions),
});

export function assessReadiness(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Readiness input must be a JSON object");
  }

  const goal = input.goal_result || {};
  const source = input.goal_input || {};
  const validation = source.validation || {};
  const humanReviewStop = source.human_review_stop || {};
  const answers = input.readiness_answers || {};
  const evidenceByCriterion = criterionEvidence(source);

  const invalidAnswers = READINESS_CRITERIA.filter(
    ({ key }) => !Object.hasOwn(ANSWER_FACTOR, answers[key]),
  ).map(({ key }) => key);
  const criterionResults = READINESS_CRITERIA.map((criterion) => {
    const answer = Object.hasOwn(ANSWER_FACTOR, answers[criterion.key])
      ? answers[criterion.key]
      : "no";
    return {
      ...criterion,
      answer,
      earned: criterion.weight * ANSWER_FACTOR[answer],
      source_evidence_present: evidenceByCriterion[criterion.key],
    };
  });
  const rawScore = criterionResults.reduce(
    (sum, criterion) => sum + criterion.earned,
    0,
  );
  const score = Math.round(rawScore);
  const unsupportedPositiveAnswers = criterionResults
    .filter(
      (criterion) =>
        criterion.answer !== "no" && !criterion.source_evidence_present,
    )
    .map((criterion) => criterion.key);

  let regeneratedGoal = null;
  let regenerationError = null;
  try {
    regeneratedGoal = renderGoal(source);
  } catch (error) {
    regenerationError = error;
  }

  const riskLevel = isNonEmptyString(input.risk_level)
    ? input.risk_level.trim().toLowerCase()
    : null;
  const validRiskLevel = ["low", "medium", "high"].includes(riskLevel);
  const applicabilityFields = [
    "mutates",
    "repeated",
    "broad",
    "long_running",
    "resumable",
  ];
  const applicabilityDeclared = applicabilityFields.every(
    (field) => typeof input[field] === "boolean",
  );
  const actualGoalCount = isNonEmptyString(goal.goal)
    ? countCharacters(goal.goal)
    : null;
  const validGoalEvidence =
    actualGoalCount !== null &&
    Number.isInteger(goal.character_count) &&
    Number.isInteger(goal.limit) &&
    goal.limit > 0 &&
    goal.limit <= COMMON_GOAL_LIMIT &&
    goal.within_limit === true &&
    actualGoalCount === goal.character_count &&
    actualGoalCount <= goal.limit &&
    actualGoalCount <= COMMON_GOAL_LIMIT;
  const semanticGoalMatch =
    regeneratedGoal !== null &&
    goal.goal === regeneratedGoal.goal &&
    goal.character_count === regeneratedGoal.character_count &&
    goal.limit === regeneratedGoal.limit &&
    goal.within_limit === regeneratedGoal.within_limit;

  const hardGates = [
    gate(
      "readiness answer completeness",
      invalidAnswers.length === 0 && MAX_SCORE === 100,
      invalidAnswers.length === 0
        ? `11 answers; weights=${MAX_SCORE}`
        : `missing or invalid answers: ${invalidAnswers.join(", ")}`,
    ),
    gate(
      "readiness answer evidence",
      unsupportedPositiveAnswers.length === 0,
      unsupportedPositiveAnswers.length === 0
        ? "every partial/yes answer has source evidence"
        : `answers exceed source evidence: ${unsupportedPositiveAnswers.join(", ")}`,
    ),
    gate(
      "specific task outcome",
      isNonEmptyString(source.task),
      isNonEmptyString(source.task)
        ? source.task.trim()
        : "goal_input.task is missing",
    ),
    gate(
      "validation checks",
      hasNonEmptyStringArray(validation.checks),
      hasNonEmptyStringArray(validation.checks)
        ? `${validation.checks.length} check(s)`
        : "validation.checks is missing",
    ),
    gate(
      "validation evidence",
      hasNonEmptyStringArray(validation.evidence),
      hasNonEmptyStringArray(validation.evidence)
        ? `${validation.evidence.length} evidence item(s)`
        : "validation.evidence is missing",
    ),
    gate(
      "boundaries",
      hasNonEmptyStringArray(source.boundaries),
      hasNonEmptyStringArray(source.boundaries)
        ? `${source.boundaries.length} boundary item(s)`
        : "goal_input.boundaries is missing",
    ),
    gate(
      "stop conditions",
      hasNonEmptyStringArray(humanReviewStop.stop_conditions),
      hasNonEmptyStringArray(humanReviewStop.stop_conditions)
        ? `${humanReviewStop.stop_conditions.length} stop condition(s)`
        : "human_review_stop.stop_conditions is missing",
    ),
    gate(
      "fallback",
      isNonEmptyString(source.fallback),
      isNonEmptyString(source.fallback)
        ? "fallback is explicit"
        : "goal_input.fallback is missing",
    ),
    gate(
      "goal integrity and character limit",
      validGoalEvidence,
      actualGoalCount !== null &&
        Number.isInteger(goal.character_count) &&
        Number.isInteger(goal.limit)
        ? `actual=${actualGoalCount}, reported=${goal.character_count}, limit=${goal.limit}, universal_limit=${COMMON_GOAL_LIMIT}`
        : "goal text or character evidence is missing",
    ),
    gate(
      "goal semantic integrity",
      semanticGoalMatch,
      semanticGoalMatch
        ? "goal_result exactly matches a fresh render of goal_input"
        : regenerationError instanceof Error
          ? `goal_input cannot be rendered: ${regenerationError.message}`
          : "goal_result differs from a fresh render of goal_input",
    ),
    gate(
      "risk declaration",
      validRiskLevel,
      validRiskLevel
        ? `risk_level=${riskLevel}`
        : "risk_level must be explicitly low, medium, or high",
    ),
    gate(
      "applicability declarations",
      applicabilityDeclared,
      applicabilityDeclared
        ? applicabilityFields
            .map((field) => `${field}=${input[field]}`)
            .join(", ")
        : `explicit booleans required: ${applicabilityFields.join(", ")}`,
    ),
    gate(
      "human approval declaration",
      typeof humanReviewStop.human_approval_required === "boolean",
      typeof humanReviewStop.human_approval_required === "boolean"
        ? `human_approval_required=${humanReviewStop.human_approval_required}`
        : "human_review_stop.human_approval_required must be explicit",
    ),
    gate(
      "required human approval",
      typeof humanReviewStop.human_approval_required === "boolean" &&
        (humanReviewStop.human_approval_required === false ||
          hasNonEmptyStringArray(humanReviewStop.approval_actions)),
      humanReviewStop.human_approval_required === true
        ? hasNonEmptyStringArray(humanReviewStop.approval_actions)
          ? `required before ${humanReviewStop.approval_actions.join(", ")}`
          : "approval is required but approval_actions is missing"
        : humanReviewStop.human_approval_required === false
          ? "approval is explicitly not required by the contract"
          : "approval declaration is missing",
    ),
  ];

  const needsChecker = riskLevel === "medium" || riskLevel === "high";
  const needsSmallRun = input.broad === true || riskLevel === "high";
  const needsBudget = input.repeated === true || input.long_running === true;
  const needsIsolation = input.mutates === true;
  const needsPersistence = input.repeated === true || input.resumable === true;

  const supervisionGates = [
    gate(
      "readiness score threshold",
      score >= 80,
      `${score}/${MAX_SCORE} (${scoreBand(score)})`,
    ),
    gate(
      "method-fit evidence",
      isNonEmptyString(source.method_fit?.reason),
      isNonEmptyString(source.method_fit?.reason)
        ? source.method_fit.reason.trim()
        : "goal_input.method_fit.reason is missing",
    ),
    gate(
      "independent checker",
      !needsChecker || isNonEmptyString(source.independent_checker),
      needsChecker
        ? isNonEmptyString(source.independent_checker)
          ? "checker is explicit"
          : `checker is required for ${riskLevel} risk`
        : "not required for low risk",
    ),
    gate(
      "smallest useful run",
      !needsSmallRun || isNonEmptyString(source.smallest_useful_run),
      needsSmallRun
        ? isNonEmptyString(source.smallest_useful_run)
          ? "smallest useful run is explicit"
          : "required for broad or high-risk work"
        : "not required",
    ),
    gate(
      "budget",
      !needsBudget || isNonEmptyString(source.budget),
      needsBudget
        ? isNonEmptyString(source.budget)
          ? "budget is explicit"
          : "required for repeated or long-running work"
        : "not required",
    ),
    gate(
      "isolation",
      !needsIsolation || isNonEmptyString(source.isolation),
      needsIsolation
        ? isNonEmptyString(source.isolation)
          ? "isolation is explicit"
          : "required for mutating work"
        : "not required",
    ),
    gate(
      "persistence",
      !needsPersistence || isNonEmptyString(source.persistence),
      needsPersistence
        ? isNonEmptyString(source.persistence)
          ? "persistence is explicit"
          : "required for repeated or resumable work"
        : "not required",
    ),
  ];

  const failedHard = hardGates.filter((item) => !item.passed);
  const failedSupervision = supervisionGates.filter((item) => !item.passed);
  const verdict =
    failedHard.length > 0
      ? "blocked"
      : failedSupervision.length > 0
        ? "supervised"
        : "ready";

  const weakestCriterion = criterionResults
    .filter((criterion) => criterion.answer !== "yes")
    .sort(
      (left, right) =>
        left.earned / left.weight - right.earned / right.weight ||
        right.weight - left.weight,
    )[0];
  const nextCorrection =
    failedHard[0] ||
    (weakestCriterion
      ? {
          name: weakestCriterion.label,
          evidence: `answer=${weakestCriterion.answer}, earned=${weakestCriterion.earned}/${weakestCriterion.weight}`,
        }
      : failedSupervision[0]) ||
    null;

  return {
    score,
    max_score: MAX_SCORE,
    score_band: scoreBand(score),
    criteria: criterionResults,
    verdict,
    hard_gates: hardGates,
    supervision_gates: supervisionGates,
    recommended_next_correction: nextCorrection
      ? `Add or correct: ${nextCorrection.name}. ${nextCorrection.evidence}`
      : "No readiness correction required.",
  };
}
