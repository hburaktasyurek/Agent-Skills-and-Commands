#!/usr/bin/env node

import fs from "node:fs";
import { METHOD_MANIFEST, renderGoal } from "./goal-core.mjs";

const fixtureUrl = new URL("../evals/valid-goal.json", import.meta.url);
const base = JSON.parse(fs.readFileSync(fixtureUrl, "utf8"));
const results = [];

const check = (name, condition, evidence) => {
  if (!condition) {
    throw new Error(`${name} failed: ${evidence}`);
  }
  results.push({ name, passed: true, evidence });
};

const defaultResult = renderGoal(base);
check(
  "default goal is within universal limit",
  defaultResult.within_limit && defaultResult.limit === 4000,
  `${defaultResult.character_count}/${defaultResult.limit}`,
);
check(
  "default goal reports no silent truncation",
  defaultResult.goal.includes(base.fallback) &&
    defaultResult.goal.includes(base.boundaries[0]),
  "fallback and first boundary are present",
);

for (const method of METHOD_MANIFEST) {
  const candidate = structuredClone(base);
  candidate.methodology = method.slug;
  const result = renderGoal(candidate);
  check(
    `${method.slug} is accepted by universal renderer`,
    result.within_limit && result.goal.includes(`Methodology: ${method.slug}`),
    `${result.character_count}/${result.limit}`,
  );
}

const toolRenders = ["Claude Code", "Codex", "Cursor", "other"].map(
  (targetTool) => {
    const candidate = structuredClone(base);
    candidate.target_tool = targetTool;
    return renderGoal(candidate);
  },
);
check(
  "target tools use one renderer without content branches",
  toolRenders.every(
    (result) =>
      result.goal === toolRenders[0].goal &&
      result.character_count === toolRenders[0].character_count &&
      result.limit === toolRenders[0].limit,
  ) &&
    toolRenders.map((result) => result.target_tool).join("|") ===
      "Claude Code|Codex|Cursor|other",
  "goal text, count, and limit are identical; only target_tool metadata differs",
);

let low = 0;
let high = 5000;
let exact = null;
while (low <= high) {
  const middle = Math.floor((low + high) / 2);
  const candidate = structuredClone(base);
  candidate.context = "X".repeat(middle);
  const result = renderGoal(candidate);
  if (result.character_count === 4000) {
    exact = { middle, result };
    break;
  }
  if (result.character_count < 4000) {
    low = middle + 1;
  } else {
    high = middle - 1;
  }
}

check(
  "exact 4000-character boundary passes",
  exact?.result.within_limit === true &&
    exact.result.character_count === 4000,
  exact ? `padding=${exact.middle}` : "no exact boundary found",
);

const over = structuredClone(base);
over.context = "X".repeat(exact.middle + 1);
const overResult = renderGoal(over);
check(
  "4001-character output fails without truncation",
  !overResult.within_limit &&
    overResult.character_count === 4001 &&
    overResult.goal.includes(over.context),
  `${overResult.character_count}/${overResult.limit}`,
);

const stricter = structuredClone(base);
stricter.target_limit = 3500;
const stricterResult = renderGoal(stricter);
check(
  "stricter target limit wins",
  stricterResult.limit === 3500,
  `effective limit=${stricterResult.limit}`,
);

const expectFailure = (name, candidate, pattern) => {
  let error = null;
  try {
    renderGoal(candidate);
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
noMethod.methodology = "none";
expectFailure(
  "none methodology stops before goal rendering",
  noMethod,
  /Unsupported methodology/,
);

const stringLimit = structuredClone(base);
stringLimit.target_limit = "100";
expectFailure(
  "invalid target limit fails instead of falling back",
  stringLimit,
  /positive integer no greater than 4000/,
);

const oversizedLimit = structuredClone(base);
oversizedLimit.target_limit = 4001;
expectFailure(
  "a limit above the universal ceiling is rejected",
  oversizedLimit,
  /positive integer no greater than 4000/,
);

const contradictoryApproval = structuredClone(base);
contradictoryApproval.human_review_stop.human_approval_required = false;
expectFailure(
  "approval actions cannot be silently discarded",
  contradictoryApproval,
  /approval_actions must be absent or empty/,
);

process.stdout.write(
  `${JSON.stringify(
    {
      passed: results.length,
      results,
      sample_goal_length: defaultResult.character_count,
    },
    null,
    2,
  )}\n`,
);
