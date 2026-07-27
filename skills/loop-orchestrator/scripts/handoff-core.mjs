import {
  assessReadiness,
  scoreBand,
  stableStringify,
} from "../../loop-readiness-score/scripts/readiness-score-core.mjs";
import { createRunRecord } from "../../loop-run-record/scripts/run-record-core.mjs";

export const CANONICAL_FIELDS = [
  "methodology",
  "task",
  "audience",
  "context",
  "output_format",
  "validation",
  "method_fit",
  "human_review_stop",
];

const clone = (value) => JSON.parse(JSON.stringify(value));
const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;
const countCharacters = (value) => Array.from(value).length;
const CREATOR_CHECKS = [
  "frontmatter_name_matches",
  "one_methodology",
  "preserves_eight_fields",
  "validation_present",
  "human_return_present",
  "canonical_method_sections_present",
];

export function canonicalContractFrom(source) {
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    throw new Error("Canonical source must be an object");
  }
  const missing = CANONICAL_FIELDS.filter(
    (field) => !Object.hasOwn(source, field),
  );
  if (missing.length > 0) {
    throw new Error(`Missing canonical fields: ${missing.join(", ")}`);
  }
  return Object.fromEntries(
    CANONICAL_FIELDS.map((field) => [field, clone(source[field])]),
  );
}

export function assertCanonicalHandoff(expected, received) {
  const expectedContract = canonicalContractFrom(expected);
  const receivedContract = canonicalContractFrom(received);
  if (JSON.stringify(expectedContract) !== JSON.stringify(receivedContract)) {
    throw new Error("Canonical eight-field contract changed during handoff");
  }
  return {
    preserved: true,
    fields: [...CANONICAL_FIELDS],
  };
}

export function terminalHandoff({
  intent,
  canonicalContract,
  selection,
  goalInput,
  goalResult,
  readinessInput,
  readinessResult,
  observation,
  creatorResult,
}) {
  const contract = canonicalContractFrom(canonicalContract);
  assertCanonicalHandoff(contract, selection?.contract);
  if (selection?.contract?.methodology === "none") {
    return {
      intent,
      stage: "selection",
      status: "none",
      canonical_contract: contract,
      artifact: selection,
      evidence: ["methodology-selector returned none"],
      next_owner: "human",
    };
  }

  if (intent === "record-run") {
    const goalHandoff = terminalHandoff({
      intent: "loop-goal",
      canonicalContract,
      selection,
      goalInput,
      goalResult,
      readinessInput,
      readinessResult,
    });
    if (goalHandoff.status !== "ready") {
      return { ...goalHandoff, intent: "record-run" };
    }
    const runRecord = createRunRecord({
      goal_input: goalInput,
      goal_result: goalResult,
      readiness_input: readinessInput,
      readiness_result: readinessResult,
      observation,
    });
    return {
      intent,
      stage: "run-record",
      status: "review-required",
      canonical_contract: contract,
      artifact: {
        goal_result: goalResult,
        readiness_result: readinessResult,
        run_record: runRecord,
      },
      evidence: [
        ...goalHandoff.evidence,
        `assessment_id=${runRecord.assessment_id}`,
        `record_id=${runRecord.record_id}`,
        `run_result=${runRecord.result}`,
      ],
      failed_hard_gates: [],
      failed_supervision_gates: [],
      recommended_next_correction:
        readinessResult.recommended_next_correction,
      next_owner: "human",
    };
  }

  if (intent === "loop-goal") {
    assertCanonicalHandoff(contract, goalInput);
    if (
      !goalResult ||
      !isNonEmptyString(goalResult.goal) ||
      !Number.isInteger(goalResult.character_count) ||
      !Number.isInteger(goalResult.limit) ||
      goalResult.limit <= 0 ||
      goalResult.limit > 4000 ||
      typeof goalResult.within_limit !== "boolean" ||
      countCharacters(goalResult.goal) !== goalResult.character_count ||
      goalResult.within_limit !==
        (goalResult.character_count <= goalResult.limit) ||
      !goalResult.goal.includes(`Methodology: ${contract.methodology}`)
    ) {
      throw new Error(
        "Missing, forged, over-ceiling, or methodology-mismatched goal artifact",
      );
    }
    const verdict = readinessResult?.verdict;
    if (!["blocked", "supervised", "ready"].includes(verdict)) {
      throw new Error("Missing or invalid readiness verdict");
    }
    if (
      typeof readinessResult.score !== "number" ||
      readinessResult.max_score !== 100 ||
      !isNonEmptyString(readinessResult.score_band) ||
      !Array.isArray(readinessResult.criteria) ||
      readinessResult.criteria.length !== 11 ||
      !Array.isArray(readinessResult.hard_gates) ||
      readinessResult.hard_gates.length !== 14 ||
      !Array.isArray(readinessResult.supervision_gates) ||
      readinessResult.supervision_gates.length !== 10 ||
      !isNonEmptyString(readinessResult.assessment_id) ||
      !isNonEmptyString(readinessResult.recommended_next_correction)
    ) {
      throw new Error("Readiness verdict is missing score or gate evidence");
    }
    if (
      !readinessInput ||
      typeof readinessInput !== "object" ||
      Array.isArray(readinessInput)
    ) {
      throw new Error("Missing readiness input for terminal verification");
    }
    const freshReadiness = assessReadiness({
      ...clone(readinessInput),
      goal_input: clone(goalInput),
      goal_result: clone(goalResult),
    });
    if (
      stableStringify(freshReadiness) !== stableStringify(readinessResult)
    ) {
      throw new Error(
        "Readiness result does not match a fresh assessment of this goal",
      );
    }
    const criteriaScore = readinessResult.criteria.reduce(
      (sum, criterion) =>
        sum +
        (typeof criterion?.earned === "number"
          ? criterion.earned
          : Number.NaN),
      0,
    );
    const criteriaWeight = readinessResult.criteria.reduce(
      (sum, criterion) =>
        sum +
        (typeof criterion?.weight === "number"
          ? criterion.weight
          : Number.NaN),
      0,
    );
    const gatesHaveEvidence = [
      ...readinessResult.hard_gates,
      ...readinessResult.supervision_gates,
    ].every(
      (item) =>
        isNonEmptyString(item?.name) &&
        typeof item?.passed === "boolean" &&
        isNonEmptyString(item?.evidence),
    );
    const expectedScoreBand = scoreBand(readinessResult.score);
    if (
      readinessResult.score < 0 ||
      readinessResult.score > readinessResult.max_score ||
      Math.round(criteriaScore) !== readinessResult.score ||
      criteriaWeight !== readinessResult.max_score ||
      readinessResult.score_band !== expectedScoreBand ||
      !gatesHaveEvidence
    ) {
      throw new Error("Readiness score or gate evidence is internally forged");
    }
    const hardFailures = readinessResult.hard_gates.filter(
      ({ passed }) => passed !== true,
    );
    const supervisionFailures = readinessResult.supervision_gates.filter(
      ({ passed }) => passed !== true,
    );
    const expectedVerdict =
      hardFailures.length > 0
        ? "blocked"
        : supervisionFailures.length > 0
          ? "supervised"
          : "ready";
    const requiredIntegrityGates = [
      "goal integrity and character limit",
      "goal semantic integrity",
    ];
    if (
      verdict !== expectedVerdict ||
      requiredIntegrityGates.some(
        (name) =>
          !readinessResult.hard_gates.some(
            (item) => item.name === name && typeof item.passed === "boolean",
          ),
      ) ||
      (verdict === "ready" && goalResult.within_limit !== true)
    ) {
      throw new Error(
        "Readiness verdict conflicts with gate evidence or goal integrity",
      );
    }
    return {
      intent,
      stage: "readiness",
      status: verdict,
      canonical_contract: contract,
      artifact: {
        goal_result: goalResult,
        readiness_result: readinessResult,
      },
      evidence: [
        `goal=${goalResult?.character_count}/${goalResult?.limit}`,
        `readiness=${verdict} score=${readinessResult.score}/${readinessResult.max_score} band=${readinessResult.score_band}`,
        `failed_hard_gates=${hardFailures.map(({ name }) => name).join(", ") || "none"}`,
        `failed_supervision_gates=${supervisionFailures.map(({ name }) => name).join(", ") || "none"}`,
        `recommended_next_correction=${readinessResult.recommended_next_correction}`,
      ],
      failed_hard_gates: hardFailures,
      failed_supervision_gates: supervisionFailures,
      recommended_next_correction:
        readinessResult.recommended_next_correction,
      next_owner: "human",
    };
  }

  if (intent === "methodology-skill") {
    const generatedSkill = creatorResult?.files?.["SKILL.md"];
    if (
      !isNonEmptyString(creatorResult?.skill_name) ||
      creatorResult?.methodology !== contract.methodology ||
      creatorResult?.method_ref !== selection?.selection?.method_ref ||
      !creatorResult?.files ||
      Object.keys(creatorResult.files).length !== 1 ||
      !isNonEmptyString(generatedSkill) ||
      !Number.isInteger(creatorResult.character_count) ||
      countCharacters(generatedSkill) !== creatorResult.character_count ||
      !creatorResult?.checks ||
      Object.keys(creatorResult.checks).length !== CREATOR_CHECKS.length ||
      CREATOR_CHECKS.some(
        (checkName) => creatorResult.checks[checkName] !== true,
      ) ||
      Object.values(creatorResult.checks).some((passed) => passed !== true) ||
      !generatedSkill.includes(`\`${contract.methodology}\``)
    ) {
      throw new Error(
        "Missing, forged, or methodology-mismatched creator artifact",
      );
    }
    return {
      intent,
      stage: "skill-creation",
      status: "review-required",
      canonical_contract: contract,
      artifact: creatorResult,
      evidence: [
        `creator_skill=${creatorResult.skill_name}`,
        `methodology=${creatorResult.methodology}`,
      ],
      next_owner: "human",
    };
  }

  throw new Error(`Unsupported intent: ${intent}`);
}
