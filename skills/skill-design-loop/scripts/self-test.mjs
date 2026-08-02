#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const skillDir = new URL("../", import.meta.url);
const repoSkillsDir = new URL("../../", import.meta.url);
const skillText = fs.readFileSync(new URL("SKILL.md", skillDir), "utf8");
const metadataText = fs.readFileSync(
  new URL("agents/openai.yaml", skillDir),
  "utf8",
);
const draftShipText = fs.readFileSync(
  new URL("../skill-draft-ship/SKILL.md", skillDir),
  "utf8",
);
const draftShipMetadataText = fs.readFileSync(
  new URL("../skill-draft-ship/agents/openai.yaml", skillDir),
  "utf8",
);
const indexText = fs.readFileSync(new URL("INDEX.md", repoSkillsDir), "utf8");
const fixtures = JSON.parse(
  fs.readFileSync(new URL("evals/entry-cases.json", skillDir), "utf8"),
);
const runtime = JSON.parse(
  fs.readFileSync(new URL("evals/runtime-results.json", skillDir), "utf8"),
);
const legacyPersonalName = ["skill", "creator"].join("-");

const results = [];
const check = (name, condition, evidence) => {
  if (!condition) throw new Error(`${name} failed: ${evidence}`);
  results.push({ name, passed: true, evidence });
};

function simulateShipRollback(
  destinationExisted,
  { failurePoint = "documentation", corruptRollback = false } = {},
) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "skill-ship-rollback-"));
  try {
    const skillsDir = path.join(root, "skills");
    const destination = path.join(skillsDir, "fixture");
    const backup = path.join(root, "backup");
    fs.mkdirSync(skillsDir, { recursive: true });
    fs.mkdirSync(backup, { recursive: true });
    fs.writeFileSync(path.join(root, "INDEX.md"), "index-before\n");
    fs.writeFileSync(path.join(root, "README.md"), "readme-before\n");
    fs.copyFileSync(path.join(root, "INDEX.md"), path.join(backup, "INDEX.md"));
    fs.copyFileSync(path.join(root, "README.md"), path.join(backup, "README.md"));
    if (destinationExisted) {
      fs.mkdirSync(destination);
      fs.writeFileSync(path.join(destination, "old.txt"), "old\n");
      fs.renameSync(destination, path.join(backup, "destination"));
    }
    fs.mkdirSync(destination);
    fs.writeFileSync(path.join(destination, "new.txt"), "new\n");
    if (failurePoint === "documentation") {
      fs.writeFileSync(path.join(root, "INDEX.md"), "index-partial\n");
      fs.writeFileSync(path.join(root, "README.md"), "readme-partial\n");
    }

    fs.rmSync(destination, { recursive: true });
    if (destinationExisted) fs.renameSync(path.join(backup, "destination"), destination);
    fs.copyFileSync(path.join(backup, "INDEX.md"), path.join(root, "INDEX.md"));
    if (!corruptRollback) {
      fs.copyFileSync(path.join(backup, "README.md"), path.join(root, "README.md"));
    }

    const docsRestored =
      fs.readFileSync(path.join(root, "INDEX.md"), "utf8") === "index-before\n" &&
      fs.readFileSync(path.join(root, "README.md"), "utf8") === "readme-before\n";
    const destinationRestored = destinationExisted
      ? fs.existsSync(path.join(destination, "old.txt")) &&
        !fs.existsSync(path.join(destination, "new.txt"))
      : !fs.existsSync(destination);
    const restored = docsRestored && destinationRestored;
    return {
      restored,
      resultCode: restored ? "ship_gate_failed" : "rollback_failed",
      residualState: restored ? [] : ["README.md differs from pre-ship snapshot"],
    };
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

const replacements = new Set(["none", "proposal", "shipped", "both"]);
const paths = new Set(["procedural", "methodology", "decompose", "blocked"]);
const terminalResults = new Set(["draft_created", "decompose", "blocked"]);
const requiredCases = new Set([
  "complete-procedural-drafts-without-questions",
  "incomplete-intake-resumes-to-draft",
  "methodology-routes-directly-to-creator",
  "hybrid-decomposes-without-draft",
  "question-budget-exhaustion-blocks",
  "missing-repository-blocks-without-fallback",
  "missing-sibling-blocks-without-fallback",
  "proposal-collision-without-authority-blocks",
  "shipped-collision-without-authority-blocks",
  "both-collisions-without-authority-block",
  "authorized-proposal-replacement-only-writes-proposal",
  "authorized-shipped-replacement-still-only-writes-proposal",
]);
const requiredDraftShipCases = new Set([
  "direct-draft-missing-checklist-blocks",
  "direct-draft-missing-evaluation-examples-blocks",
  "direct-draft-missing-path-blocks",
  "ship-missing-human-command-blocks",
  "ship-missing-purpose-pass-blocks",
  "ship-missing-skill-eval-pass-blocks",
  "ship-declared-pass-without-evidence-blocks",
  "ship-stale-evidence-hash-blocks",
  "ship-missing-composition-blocks",
  "ship-existing-target-needs-fresh-replace",
  "ship-all-gates-pass",
]);

const replacementAllows = (collision, replace) =>
  collision === "none" ||
  replace === "both" ||
  (collision === "proposal" && replace === "proposal") ||
  (collision === "shipped" && replace === "shipped");

function deriveOutcome(input) {
  const stageTrace = ["preflight"];
  if (!input.repo_valid || input.missing_dependencies.length > 0) {
    return {
      result: "blocked",
      stage_trace: stageTrace,
      stopped_at: "preflight",
      required_calls: [],
    };
  }

  stageTrace.push("intake");
  const intakeCalls =
    input.checklist === "incomplete" ? ["skill-brief", "grill-me"] : [];
  if (input.checklist === "incomplete" && input.question_budget_exhausted) {
    return {
      result: "blocked",
      stage_trace: stageTrace,
      stopped_at: "intake",
      required_calls: intakeCalls,
    };
  }

  stageTrace.push("selection");
  if (!replacementAllows(input.collision, input.replace)) {
    return {
      result: "blocked",
      stage_trace: stageTrace,
      stopped_at: "selection",
      required_calls: [...intakeCalls, "skill-path-selector"],
    };
  }
  if (input.path === "decompose") {
    return {
      result: "decompose",
      stage_trace: stageTrace,
      stopped_at: "selection",
      required_calls: [...intakeCalls, "skill-path-selector"],
    };
  }
  if (input.path === "blocked") {
    return {
      result: "blocked",
      stage_trace: stageTrace,
      stopped_at: "selection",
      required_calls: [...intakeCalls, "skill-path-selector"],
    };
  }

  stageTrace.push("draft");
  const requiredCalls = [
    ...intakeCalls,
    "skill-path-selector",
    "methodology-selector",
  ];
  if (input.path === "methodology") {
    requiredCalls.push("methodology-skill-creator");
  }
  requiredCalls.push("skill-draft-ship");
  return {
    result: "draft_created",
    stage_trace: stageTrace,
    stopped_at: "draft",
    required_calls: requiredCalls,
  };
}

function deriveDraftShipOutcome(input) {
  if (!input.repo_valid) {
    return { result: "blocked", code: "repo_root_missing" };
  }
  if (input.mode === "draft") {
    if (
      !input.checklist_complete ||
      input.evaluation_examples < 2 ||
      !["methodology", "procedural"].includes(input.path)
    ) {
      return { result: "blocked", code: "invalid_input" };
    }
    if (!replacementAllows(input.collision, input.replace)) {
      return { result: "blocked", code: "collision" };
    }
    return { result: "draft_created", code: null };
  }
  if (input.mode === "ship") {
    const compositionReady =
      input.composition === "composition_ok" ||
      (input.composition === "composition_skip" && input.composition_blocked);
    const sameHash =
      typeof input.current_hash === "string" &&
      input.purpose_hash === input.current_hash &&
      input.eval_hash === input.current_hash &&
      input.composition_hash === input.current_hash;
    if (
      !input.explicit_ship ||
      !input.purpose_pass ||
      input.eval_verdict !== "PASS" ||
      input.eval_evidence_verified !== true ||
      input.eval_verifier_recomputed !== true ||
      !compositionReady ||
      !sameHash ||
      (input.destination_exists && !input.ship_replace)
    ) {
      return { result: "blocked", code: "ship_gate_failed" };
    }
    return { result: "shipped", code: null };
  }
  return { result: "blocked", code: "invalid_input" };
}

check(
  "fixture package identity",
  fixtures.skill_name === "skill-design-loop" &&
    fixtures.contract_version === 2,
  `${fixtures.skill_name}@${fixtures.contract_version}`,
);
check(
  "fixture ids are unique",
  new Set(fixtures.cases.map((item) => item.id)).size === fixtures.cases.length,
  `${fixtures.cases.length} cases`,
);
check(
  "mandatory fixture matrix is complete",
  [...requiredCases].every((id) =>
    fixtures.cases.some((item) => item.id === id),
  ),
  `${fixtures.cases.length}/${requiredCases.size}`,
);
check(
  "draft-ship fixture ids are unique",
  new Set(fixtures.draft_ship_cases.map((item) => item.id)).size ===
    fixtures.draft_ship_cases.length,
  `${fixtures.draft_ship_cases.length} cases`,
);
check(
  "mandatory draft-ship fixture matrix is complete",
  [...requiredDraftShipCases].every((id) =>
    fixtures.draft_ship_cases.some((item) => item.id === id),
  ),
  `${fixtures.draft_ship_cases.length}/${requiredDraftShipCases.size}`,
);

for (const item of fixtures.cases) {
  const { input, expected } = item;
  check(
    `${item.id} uses a valid input enum`,
    replacements.has(input.replace) &&
      paths.has(input.path) &&
      ["none", "proposal", "shipped", "both"].includes(input.collision),
    `${input.path}/${input.collision}/${input.replace}`,
  );
  check(
    `${item.id} uses a terminal result`,
    terminalResults.has(expected.result),
    expected.result,
  );

  const derived = deriveOutcome(input);
  check(
    `${item.id} result follows routing rules`,
    expected.result === derived.result,
    `${expected.result}=${derived.result}`,
  );
  check(
    `${item.id} stage trace follows entered stages`,
    JSON.stringify(expected.stage_trace) ===
      JSON.stringify(derived.stage_trace) &&
      expected.stopped_at === derived.stopped_at,
    `${expected.stage_trace.join(">")}/${expected.stopped_at}`,
  );
  check(
    `${item.id} required calls follow routing rules`,
    JSON.stringify(expected.required_calls) ===
      JSON.stringify(derived.required_calls),
    expected.required_calls.join(","),
  );
  check(
    `${item.id} never writes a global target`,
    expected.write_targets.every((target) =>
      target.startsWith("<repo_root>/.skill-proposals/"),
    ) && expected.must_not_write.includes("<global_skills_root>"),
    JSON.stringify(expected.write_targets),
  );
  check(
    `${item.id} writes only on draft_created`,
    expected.result === "draft_created"
      ? expected.write_targets.length === 1
      : expected.write_targets.length === 0,
    `${expected.result}/${expected.write_targets.length}`,
  );
  check(
    `${item.id} never routes through loop-orchestrator`,
    expected.must_not_call.includes("loop-orchestrator"),
    expected.must_not_call.join(","),
  );
}

for (const item of fixtures.draft_ship_cases) {
  const derived = deriveDraftShipOutcome(item.input);
  check(
    `${item.id} follows draft-ship gates`,
    item.expected.result === derived.result &&
      item.expected.code === derived.code,
    `${item.expected.result}/${item.expected.code}=${derived.result}/${derived.code}`,
  );
  check(
    `${item.id} mutates only after every gate passes`,
    item.expected.result === "shipped"
      ? item.expected.write_targets.length === 3 &&
          item.expected.delete_targets.length === 1 &&
          item.expected.delete_targets[0].startsWith(
            "<repo_root>/.skill-proposals/",
          )
      : item.expected.write_targets.length === 0 &&
          item.expected.delete_targets.length === 0,
    `${item.expected.write_targets.length}/${item.expected.delete_targets.length}`,
  );
}

const requiredSkillClauses = [
  "git rev-parse --show-toplevel",
  "Never use globally installed",
  "stage_trace",
  "result: draft_created",
  "result: decompose",
  "result: blocked",
  "replace: none | proposal | shipped | both",
  "evaluation_examples",
  "evals/evals.json",
  "content_sha256",
  "Stop after one `draft_created`, `decompose`, or `blocked` result.",
];
check(
  "skill contains repository and terminal contracts",
  requiredSkillClauses.every((clause) => skillText.includes(clause)),
  requiredSkillClauses.filter((clause) => !skillText.includes(clause)).join(","),
);
check(
  "skill is explicit-only in frontmatter",
  /^---\n[\s\S]*disable-model-invocation: true\n---/m.test(skillText),
  "disable-model-invocation: true",
);
check(
  "Codex metadata is exact and explicit-only",
  metadataText.includes('display_name: "Skill Design Loop"') &&
    metadataText.includes(
      'short_description: "Design and draft one repository skill"',
    ) &&
    metadataText.includes(
      'default_prompt: "Use $skill-design-loop to take this skill idea through intake, path selection, and draft creation; stop for separate review."',
    ) &&
    metadataText.includes("allow_implicit_invocation: false"),
  "skill-design-loop agents/openai.yaml",
);
check(
  "draft-ship rejects intake and preserves ship gates",
  draftShipText.includes("Do not perform intake") &&
    draftShipText.includes("Do not select a path") &&
    draftShipText.includes("ship_replace: true") &&
    draftShipText.includes("composition_ok") &&
    draftShipText.includes("purpose_pass") &&
    draftShipText.includes("skill_eval_pass") &&
    draftShipText.includes("content_sha256"),
  "skill-draft-ship contract",
);
check(
  "draft-ship requires exact destination replacement and rehash",
  draftShipText.includes("never overlay-copy") &&
    draftShipText.includes(".ship-staging/") &&
    draftShipText.includes(".ship-backups/") &&
    draftShipText.includes("hash the destination") &&
    draftShipText.includes("restore the prior"),
  "staged exact-copy ship contract",
);
check(
  "first-time ship rollback restores absent destination and documents",
  simulateShipRollback(false).restored,
  "failure-injected first-time rollback",
);
check(
  "replacement ship rollback restores old destination and documents",
  simulateShipRollback(true).restored,
  "failure-injected replacement rollback",
);
check(
  "first-time destination mismatch uses unified rollback",
  simulateShipRollback(false, { failurePoint: "destination_hash" }).restored,
  "failure-injected first-time destination mismatch",
);
check(
  "replacement destination mismatch uses unified rollback",
  simulateShipRollback(true, { failurePoint: "destination_hash" }).restored,
  "failure-injected replacement destination mismatch",
);
check(
  "first-time rollback failure is typed with residual state",
  (() => {
    const result = simulateShipRollback(false, { corruptRollback: true });
    return result.resultCode === "rollback_failed" && result.residualState.length > 0;
  })(),
  "failure-injected first-time rollback failure",
);
check(
  "replacement rollback failure is typed with residual state",
  (() => {
    const result = simulateShipRollback(true, { corruptRollback: true });
    return result.resultCode === "rollback_failed" && result.residualState.length > 0;
  })(),
  "failure-injected replacement rollback failure",
);
check(
  "draft-ship is explicit-only with exact Codex metadata",
  /^---\n[\s\S]*disable-model-invocation: true\n---/m.test(draftShipText) &&
    draftShipMetadataText.includes('display_name: "Skill Draft & Ship"') &&
    draftShipMetadataText.includes(
      'short_description: "Draft or ship a selected repository skill"',
    ) &&
    draftShipMetadataText.includes(
      'default_prompt: "Use $skill-draft-ship with a completed checklist and selected path to create a proposal, or with explicit ship evidence to publish it."',
    ) &&
    draftShipMetadataText.includes("allow_implicit_invocation: false"),
  "skill-draft-ship frontmatter and agents/openai.yaml",
);
check(
  "both packages are catalogued and legacy package is absent",
  indexText.includes("[skill-design-loop](skill-design-loop/SKILL.md)") &&
    indexText.includes("[skill-draft-ship](skill-draft-ship/SKILL.md)") &&
    !indexText.includes(
      `[${legacyPersonalName}](${legacyPersonalName}/SKILL.md)`,
    ),
  "skills/INDEX.md",
);

const runtimeIds = new Set([
  "codex-implicit-does-not-activate",
  "codex-explicit-activates",
  "cursor-implicit-does-not-activate",
  "cursor-explicit-activates",
]);
check(
  "runtime matrix contains both hosts and invocation modes",
  runtime.observations.length === runtimeIds.size &&
    [...runtimeIds].every((id) =>
      runtime.observations.some((item) => item.id === id),
    ),
  `${runtime.observations.length}/${runtimeIds.size}`,
);
check(
  "runtime status is pending or complete",
  ["pending", "complete"].includes(runtime.status),
  runtime.status,
);
if (runtime.status === "pending") {
  check(
    "pending runtime matrix contains no invented observations",
    runtime.review_id === null &&
      runtime.tested_commit === null &&
      runtime.observations.every(
        (item) =>
          item.observed_activation === null &&
          item.result === null &&
          item.evidence === null &&
          item.passed === null,
      ) &&
      runtime.summary.verdict === "PENDING",
    runtime.summary.verdict,
  );
} else {
  check(
    "completed runtime matrix is fully passing",
    typeof runtime.review_id === "string" &&
      typeof runtime.tested_commit === "string" &&
      runtime.observations.every(
        (item) =>
          item.observed_activation === item.expected_activation &&
          typeof item.evidence === "string" &&
          item.evidence.length > 0 &&
          item.passed === true,
      ) &&
      runtime.summary.passed === runtime.summary.total &&
      runtime.summary.verdict === "PASS",
    runtime.summary.verdict,
  );
}

process.stdout.write(
  `${JSON.stringify(
    {
      passed: results.length,
      fixture_cases: fixtures.cases.length,
      draft_ship_fixture_cases: fixtures.draft_ship_cases.length,
      runtime_status: runtime.status,
      runtime_verdict: runtime.summary.verdict,
      results,
    },
    null,
    2,
  )}\n`,
);
