import { createHash } from "node:crypto";
import {
  assessReadiness,
  stableStringify,
} from "../../loop-readiness-score/scripts/readiness-score-core.mjs";

const CHECK_STATUSES = new Set(["pass", "partial", "fail"]);
const HYPOTHESIS_OUTCOMES = new Set([
  "confirmed",
  "rejected",
  "inconclusive",
  "not-applicable",
]);
const NEXT_ACTIONS = new Set(["stop", "adjust", "human-action"]);

const isObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value);
const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const requireObject = (value, field) => {
  if (!isObject(value)) throw new Error(`${field} must be a JSON object`);
  return value;
};

const requireString = (value, field) => {
  if (!isNonEmptyString(value)) {
    throw new Error(`${field} must be a non-empty string`);
  }
  return value.trim();
};

const requireStringList = (value, field) => {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.some((item) => !isNonEmptyString(item))
  ) {
    throw new Error(`${field} must be a non-empty string list`);
  }
  return value.map((item) => item.trim());
};

const requireMatchingCopy = (container, field, canonical) => {
  if (
    Object.hasOwn(container, field) &&
    stableStringify(container[field]) !== stableStringify(canonical)
  ) {
    throw new Error(`readiness_input.${field} is stale or detached`);
  }
};

export function createRunRecord(input) {
  requireObject(input, "run record input");
  const goalInput = requireObject(input.goal_input, "goal_input");
  const goalResult = requireObject(input.goal_result, "goal_result");
  const readinessInput = requireObject(input.readiness_input, "readiness_input");
  const readinessResult = requireObject(
    input.readiness_result,
    "readiness_result",
  );
  const observation = requireObject(input.observation, "observation");

  requireMatchingCopy(readinessInput, "goal_input", goalInput);
  requireMatchingCopy(readinessInput, "goal_result", goalResult);
  const canonicalReadinessInput = {
    ...readinessInput,
    goal_input: goalInput,
    goal_result: goalResult,
  };
  const freshReadiness = assessReadiness(canonicalReadinessInput);
  if (
    stableStringify(freshReadiness) !== stableStringify(readinessResult)
  ) {
    throw new Error(
      "readiness_result is stale, forged, or detached from the exact goal",
    );
  }
  if (freshReadiness.verdict !== "ready") {
    throw new Error(
      `run records require readiness verdict ready; received ${freshReadiness.verdict}`,
    );
  }

  const expectedChecks = requireStringList(
    goalInput.validation?.checks,
    "goal_input.validation.checks",
  );
  const expectedEvidence = requireStringList(
    goalInput.validation?.evidence,
    "goal_input.validation.evidence",
  );
  if (
    !Array.isArray(observation.check_results) ||
    observation.check_results.length !== expectedChecks.length
  ) {
    throw new Error(
      `observation.check_results must contain exactly ${expectedChecks.length} result(s)`,
    );
  }

  const checkResults = observation.check_results.map((candidate, index) => {
    requireObject(candidate, `observation.check_results[${index}]`);
    const check = requireString(
      candidate.check,
      `observation.check_results[${index}].check`,
    );
    if (check !== expectedChecks[index]) {
      throw new Error(
        `observation.check_results[${index}].check must exactly match the canonical validation check`,
      );
    }
    if (!CHECK_STATUSES.has(candidate.status)) {
      throw new Error(
        `observation.check_results[${index}].status must be pass, partial, or fail`,
      );
    }
    return {
      check,
      status: candidate.status,
      evidence: requireStringList(
        candidate.evidence,
        `observation.check_results[${index}].evidence`,
      ),
    };
  });

  if (!HYPOTHESIS_OUTCOMES.has(observation.hypothesis_outcome)) {
    throw new Error(
      "observation.hypothesis_outcome must be confirmed, rejected, inconclusive, or not-applicable",
    );
  }
  const hasHypothesis = isNonEmptyString(goalInput.hypothesis);
  if (hasHypothesis && observation.hypothesis_outcome === "not-applicable") {
    throw new Error(
      "hypothesis_outcome cannot be not-applicable when the goal has a hypothesis",
    );
  }
  if (!hasHypothesis && observation.hypothesis_outcome !== "not-applicable") {
    throw new Error(
      "hypothesis_outcome must be not-applicable when the goal has no hypothesis",
    );
  }
  if (!NEXT_ACTIONS.has(observation.next_action)) {
    throw new Error(
      "observation.next_action must be stop, adjust, or human-action",
    );
  }

  const result = checkResults.some(({ status }) => status === "fail")
    ? "no"
    : checkResults.some(({ status }) => status === "partial")
      ? "partial"
      : "yes";
  const feedback = requireString(observation.feedback, "observation.feedback");
  const humanReturnReason = requireString(
    observation.human_return_reason,
    "observation.human_return_reason",
  );
  const actualEvidence = checkResults.flatMap(({ evidence }) => evidence);

  const record = {
    assessment_id: freshReadiness.assessment_id,
    methodology: goalInput.methodology,
    goal_character_count: goalResult.character_count,
    readiness: {
      score: freshReadiness.score,
      band: freshReadiness.score_band,
      verdict: freshReadiness.verdict,
    },
    expected_evidence: expectedEvidence,
    actual_evidence: actualEvidence,
    check_results: checkResults,
    result,
    hypothesis_outcome: observation.hypothesis_outcome,
    feedback,
    next_action: observation.next_action,
    human_return_reason: humanReturnReason,
    status: "review-required",
  };
  const recordId = createHash("sha256")
    .update(stableStringify(record))
    .digest("hex");

  return { record_id: `sha256:${recordId}`, ...record };
}
