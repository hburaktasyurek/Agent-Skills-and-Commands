#!/usr/bin/env node

import fs from "node:fs";
import {
  METHOD_MANIFEST,
  renderMethodologySkill,
} from "./methodology-skill-core.mjs";

const fixtureUrl = new URL("../evals/valid-creator-input.json", import.meta.url);
const base = JSON.parse(fs.readFileSync(fixtureUrl, "utf8"));
const results = [];

const check = (name, condition, evidence) => {
  if (!condition) {
    throw new Error(`${name} failed: ${evidence}`);
  }
  results.push({ name, passed: true, evidence });
};

for (const method of METHOD_MANIFEST) {
  const candidate = structuredClone(base);
  candidate.skill_name = `test-${method.slug}`;
  candidate.contract.methodology = method.slug;
  candidate.selection.methodology_name = method.name;
  candidate.selection.method_ref = method.method_ref;
  const result = renderMethodologySkill(candidate);
  check(
    `${method.slug} renders one valid skill`,
    Object.keys(result.files).length === 1 &&
      Object.values(result.checks).every(Boolean),
    `${result.character_count} characters`,
  );
}

const overFourThousand = structuredClone(base);
overFourThousand.skill_name = "test-long-focused-methodology-skill";
overFourThousand.contract.context =
  `${base.contract.context} `.repeat(25).trim();
const overFourThousandResult = renderMethodologySkill(overFourThousand);
check(
  "focused skills may exceed 4,000 characters",
  overFourThousandResult.character_count > 4000 &&
    Object.values(overFourThousandResult.checks).every(Boolean),
  `${overFourThousandResult.character_count} characters accepted without truncation`,
);

const expectFailure = (name, candidate, pattern) => {
  let error = null;
  try {
    renderMethodologySkill(candidate);
  } catch (caught) {
    error = caught;
  }
  check(
    name,
    error instanceof Error && pattern.test(error.message),
    error?.message || "render unexpectedly succeeded",
  );
};

const noMethod = structuredClone(base);
noMethod.contract.methodology = "none";
expectFailure("none is rejected", noMethod, /Unsupported methodology/);

const mismatchedRef = structuredClone(base);
mismatchedRef.selection.method_ref = "references/five-whys.md";
expectFailure("method reference mismatch is rejected", mismatchedRef, /mismatch/);

const selfCreation = structuredClone(base);
selfCreation.skill_name = "methodology-skill-creator";
expectFailure("self-generation is rejected", selfCreation, /cannot generate itself/);

const existingSkill = structuredClone(base);
existingSkill.skill_name = "goal-engineering";
expectFailure(
  "existing skill name is rejected",
  existingSkill,
  /already exists/,
);

const contradictoryApproval = structuredClone(base);
contradictoryApproval.contract.human_review_stop.human_approval_required =
  false;
expectFailure(
  "contradictory approval is rejected",
  contradictoryApproval,
  /approval_actions must be absent or empty/,
);

process.stdout.write(
  `${JSON.stringify({ passed: results.length, results }, null, 2)}\n`,
);
