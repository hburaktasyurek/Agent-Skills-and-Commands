#!/usr/bin/env node

import fs from "node:fs";
import {
  METHOD_MANIFEST,
  renderGoal,
} from "../../goal-engineering/scripts/goal-core.mjs";
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

const goalFixtureUrl = new URL(
  "../../goal-engineering/evals/valid-goal.json",
  import.meta.url,
);
const baseGoalInput = JSON.parse(fs.readFileSync(goalFixtureUrl, "utf8"));
const routingFixture = JSON.parse(
  fs.readFileSync(
    new URL(
      "../../methodology-selector/evals/routing-cases.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const coldRouting = JSON.parse(
  fs.readFileSync(
    new URL(
      "../../methodology-selector/evals/cold-routing-results.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const coldById = new Map(
  coldRouting.cases.map((candidate) => [candidate.id, candidate]),
);
const allYes = Object.fromEntries(
  READINESS_CRITERIA.map(({ key }) => [key, "yes"]),
);

const parseCanonicalMethod = (methodRef) => {
  const referenceUrl = new URL(
    `../../methodology-selector/${methodRef}`,
    import.meta.url,
  );
  const source = fs.readFileSync(referenceUrl, "utf8");
  const fit = source.match(
    /## Fit\s+- Best when ([\s\S]*?)\.\s+- Avoid when ([\s\S]*?)\.\s+## Principles/,
  );
  if (!fit) {
    throw new Error(`Cannot parse canonical Fit section: ${methodRef}`);
  }
  const qualityBlock = source.match(
    /## Quality questions\s+([\s\S]*?)\s+## Stop/,
  )?.[1];
  const qualityQuestions = qualityBlock
    ?.split("\n")
    .map((line) => line.match(/^- (.+)$/)?.[1])
    .filter(Boolean);
  if (!qualityQuestions || qualityQuestions.length === 0) {
    throw new Error(`Cannot parse canonical quality questions: ${methodRef}`);
  }
  return {
    methodFit: {
      best_when: fit[1].replace(/\s+/g, " ").trim(),
      avoid_when: fit[2].replace(/\s+/g, " ").trim(),
    },
    qualityQuestions,
  };
};

const matrix = METHOD_MANIFEST.map((method) => {
  const routingCase = routingFixture.cases.find(
    (candidate) =>
      candidate.kind === "positive" &&
      candidate.expected_methodology === method.slug,
  );
  const coldResult = coldById.get(routingCase?.id);
  if (
    !routingCase ||
    !coldResult ||
    coldResult.observed_methodology !== method.slug ||
    coldResult.expected_methodology !== method.slug ||
    coldResult.must_not_violations.length !== 0 ||
    coldResult.passed !== true
  ) {
    throw new Error(
      `Missing passing independent selector result for ${method.slug}`,
    );
  }

  const goalInput = {
    ...structuredClone(baseGoalInput),
    ...structuredClone(routingCase.input),
  };
  const canonicalMethod = parseCanonicalMethod(method.method_ref);
  const canonicalFit = canonicalMethod.methodFit;
  goalInput.methodology = coldResult.observed_methodology;
  goalInput.method_fit = {
    ...canonicalFit,
    reason: `Independent cold routing case ${routingCase.id} selected ${method.slug}.`,
  };

  const canonicalContract = canonicalContractFrom(goalInput);
  const selection = {
    contract: canonicalContract,
    selection: {
      methodology_name: method.name,
      reason: canonicalContract.method_fit.reason,
      deferred_method: coldResult.observed_deferred_method,
      method_ref: method.method_ref,
      quality_questions: canonicalMethod.qualityQuestions,
      cold_routing_review_id: coldRouting.review_id,
      cold_routing_case: routingCase.id,
    },
  };
  const creatorInput = {
    skill_name: `integration-${method.slug}`,
    contract: canonicalContract,
    selection: {
      methodology_name: method.name,
      method_ref: method.method_ref,
    },
  };

  const goalResult = renderGoal(goalInput);
  const readinessAnswers = { ...allYes };
  if (
    goalInput.human_review_stop.human_approval_required === false
  ) {
    readinessAnswers.human_approval_gate = "no";
  }
  const readinessInput = {
    goal_input: goalInput,
    goal_result: goalResult,
    readiness_answers: readinessAnswers,
    risk_level: "medium",
    mutates: true,
    repeated: true,
    broad: true,
    long_running: false,
    resumable: false,
    scheduled: false,
  };
  const readinessResult = assessReadiness(readinessInput);
  const creatorResult = renderMethodologySkill(creatorInput);
  const goalContractCheck = assertCanonicalHandoff(
    canonicalContract,
    goalInput,
  );
  const creatorContractCheck = assertCanonicalHandoff(
    canonicalContract,
    creatorInput.contract,
  );
  const goalHandoff = terminalHandoff({
    intent: "loop-goal",
    canonicalContract,
    selection,
    goalInput,
    goalResult,
    readinessInput,
    readinessResult,
  });
  const creatorHandoff = terminalHandoff({
    intent: "methodology-skill",
    canonicalContract,
    selection,
    creatorResult,
  });
  const generatedSkill = creatorResult.files["SKILL.md"];
  const canonicalReference = fs.readFileSync(
    new URL(
      `../../methodology-selector/${method.method_ref}`,
      import.meta.url,
    ),
    "utf8",
  );

  const passed =
    goalResult.within_limit === true &&
    goalResult.character_count <= 4000 &&
    readinessResult.score >= 80 &&
    readinessResult.verdict === "ready" &&
    Object.keys(creatorResult.files).length === 1 &&
    Object.values(creatorResult.checks).every(Boolean) &&
    goalContractCheck.preserved &&
    creatorContractCheck.preserved &&
    goalHandoff.status === "ready" &&
    creatorHandoff.status === "review-required" &&
    goalHandoff.next_owner === "human" &&
    creatorHandoff.next_owner === "human" &&
    generatedSkill.includes(canonicalFit.best_when) &&
    generatedSkill.includes(canonicalFit.avoid_when) &&
    canonicalReference.includes(`# ${method.name}`) &&
    selection.selection.quality_questions.length > 0 &&
    selection.selection.quality_questions.every((question) =>
      canonicalReference.includes(question),
    );

  if (!passed) {
    throw new Error(
      `Full integration failed for ${method.slug}: ${JSON.stringify({
        goal: `${goalResult.character_count}/${goalResult.limit}`,
        readiness: `${readinessResult.score}/${readinessResult.max_score} ${readinessResult.verdict}`,
        creator_checks: creatorResult.checks,
      })}`,
    );
  }

  return {
      methodology: method.slug,
      selector_case: routingCase.id,
      selector_review: coldRouting.review_id,
      method_ref: method.method_ref,
    canonical_fields: goalContractCheck.fields.length,
    goal: `${goalResult.character_count}/${goalResult.limit}`,
    readiness: `${readinessResult.score}/${readinessResult.max_score} ${readinessResult.verdict}`,
    methodology_skill: `${creatorResult.character_count} characters`,
    goal_handoff: goalHandoff.status,
    skill_handoff: creatorHandoff.status,
    passed,
  };
});

const maxGoalLength = Math.max(
  ...matrix.map(({ goal }) => Number(goal.split("/")[0])),
);

process.stdout.write(
  `${JSON.stringify(
    {
      passed: matrix.length,
      expected: METHOD_MANIFEST.length,
      max_goal_length: `${maxGoalLength}/4000`,
      states_covered_elsewhere: [
        "none",
        "blocked",
        "supervised",
        "ready",
        "review-required",
      ],
      matrix,
    },
    null,
    2,
  )}\n`,
);
