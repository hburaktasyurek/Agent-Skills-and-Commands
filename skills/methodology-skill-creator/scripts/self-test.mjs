#!/usr/bin/env node

import fs from "node:fs";
import {
  METHOD_MANIFEST,
  SKILL_SUMMARY_LIMIT,
  renderMethodologySkill,
  stripFitSection,
} from "./methodology-skill-core.mjs";

const fixtureUrl = new URL("../evals/valid-creator-input.json", import.meta.url);
const base = JSON.parse(fs.readFileSync(fixtureUrl, "utf8"));
const results = [];

const TG_DESCRIPTION =
  "Apply 5W2H to ground a non-trivial software task into an evidence-backed decision context before specification or implementation. Use when A vague task needs a complete operating frame. Triggers: start task N; take the next roadmap item; görev N'e başlayalım.";

const TS_DESCRIPTION =
  "Apply Work Breakdown Structure to produce an evidence-backed four-file specification for one bounded software change. Use when The required four-file specification and ordered implementation work packages must be decomposed into independently reviewable deliverables. Triggers: to-spec; write the spec; hand this off.";

const extractDescription = (skillMarkdown) => {
  const match = skillMarkdown.match(/^description: (.+)$/m);
  if (!match) {
    return null;
  }
  return JSON.parse(match[1]);
};

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
  const skill = result.files["SKILL.md"];
  const description = extractDescription(skill);
  check(
    `${method.slug} renders one valid skill`,
    Object.keys(result.files).length === 1 &&
      Object.values(result.checks).every(Boolean) &&
      !skill.includes("https://loopengineering.app/") &&
      !skill.includes("## Fit") &&
      skill.includes("## When to use") &&
      description &&
      description.startsWith(`Apply ${method.name} to `) &&
      description.includes(". Use when ") &&
      !description.includes(` for ${candidate.contract.audience}`) &&
      !description.includes(
        "Follow the embedded method, validation, and human-stop rules.",
      ),
    `${result.character_count} characters; description ok`,
  );
}

const contractUrl = structuredClone(base);
contractUrl.skill_name = "test-contract-url-preserved";
contractUrl.contract.context =
  "Use the task-owned evidence at https://example.com/task-evidence.";
const contractUrlResult = renderMethodologySkill(contractUrl);
check(
  "only canonical external attribution is removed",
  contractUrlResult.files["SKILL.md"].includes(
    "https://example.com/task-evidence",
  ) &&
    !contractUrlResult.files["SKILL.md"].includes(
      "https://loopengineering.app/",
    ),
  "contract URL preserved; canonical external attribution absent",
);

const operationalResult = renderMethodologySkill({
  ...structuredClone(base),
  skill_name: "test-operational-runtime-skill",
});
check(
  "generated artifact is an operational skill, not an assignment report",
  operationalResult.checks.operational_skill_structure &&
    operationalResult.files["SKILL.md"].includes("## Objective") &&
    operationalResult.files["SKILL.md"].includes("## Operating instructions") &&
    operationalResult.files["SKILL.md"].includes("## Workflow") &&
    operationalResult.files["SKILL.md"].includes("## Execution checks") &&
    !operationalResult.files["SKILL.md"].includes("## Assignment contract") &&
    !operationalResult.files["SKILL.md"].includes("\nContext: ") &&
    !operationalResult.files["SKILL.md"].includes("## Fit"),
  "operational headings present; assignment-report headings absent; Fit absent",
);

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

const withInvocation = structuredClone(base);
withInvocation.skill_name = "test-invocation-triggers";
withInvocation.invocation = [
  "alias-one",
  "alias-two",
  "alias-three",
  "alias-four",
  "alias-five",
];
const invocationResult = renderMethodologySkill(withInvocation);
const invocationSkill = invocationResult.files["SKILL.md"];
const invocationDescription = extractDescription(invocationSkill);
check(
  "invocation puts three Triggers in description and five in body",
  invocationDescription.includes(
    "Triggers: alias-one; alias-two; alias-three.",
  ) &&
    !invocationDescription.includes("alias-four") &&
    !invocationDescription.includes("alias-five") &&
    invocationSkill.includes("## Invocation") &&
    invocationSkill.includes("- alias-one") &&
    invocationSkill.includes("- alias-five"),
  invocationDescription,
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

const missingSummary = structuredClone(base);
delete missingSummary.skill_summary;
expectFailure("skill_summary is required", missingSummary, /skill_summary/);

const longSummary = structuredClone(base);
longSummary.skill_name = "test-long-summary";
longSummary.skill_summary = "x".repeat(SKILL_SUMMARY_LIMIT + 1);
expectFailure(
  "skill_summary over limit is rejected",
  longSummary,
  /skill_summary exceeds/,
);

const newlineSummary = structuredClone(base);
newlineSummary.skill_name = "test-newline-summary";
newlineSummary.skill_summary = "line one\nline two";
expectFailure(
  "newline in skill_summary is rejected",
  newlineSummary,
  /newline rejected/,
);

const longDescription = structuredClone(base);
longDescription.skill_name = "test-long-description";
longDescription.skill_summary = "y".repeat(SKILL_SUMMARY_LIMIT);
longDescription.contract.method_fit.best_when = "z".repeat(200);
expectFailure(
  "composed description over limit is rejected",
  longDescription,
  /description exceeds/,
);

const longAlias = structuredClone(base);
longAlias.skill_name = "test-long-alias";
longAlias.invocation = ["a".repeat(49)];
expectFailure(
  "alias over limit is rejected",
  longAlias,
  /alias exceeds/,
);

const audienceOverlap = structuredClone(base);
audienceOverlap.skill_name = "test-audience-overlap-ok";
audienceOverlap.skill_summary = "Decompose a twelve-package API migration";
audienceOverlap.contract.audience = "independently reviewable work packages";
audienceOverlap.contract.method_fit.best_when =
  "A large deliverable needs independently reviewable work packages.";
const audienceOverlapResult = renderMethodologySkill(audienceOverlap);
check(
  "audience text overlapping best_when is not a false leak",
  Object.values(audienceOverlapResult.checks).every(Boolean) &&
    extractDescription(audienceOverlapResult.files["SKILL.md"]).includes(
      "independently reviewable work packages",
    ) &&
    !extractDescription(audienceOverlapResult.files["SKILL.md"]).includes(
      ` for ${audienceOverlap.contract.audience}`,
    ),
  extractDescription(audienceOverlapResult.files["SKILL.md"]),
);

const fitAtEnd = stripFitSection(
  "## Definition\n\nx\n\n## Fit\n\n- Best when a.\n- Avoid when b.\n",
);
check(
  "Fit section is stripped when it is the final heading",
  !fitAtEnd.includes("## Fit") && fitAtEnd.includes("## Definition"),
  fitAtEnd,
);

const tgCandidate = {
  skill_name: "test-tg-description-pin",
  skill_summary:
    "ground a non-trivial software task into an evidence-backed decision context before specification or implementation",
  invocation: [
    "start task N",
    "take the next roadmap item",
    "görev N'e başlayalım",
  ],
  contract: {
    methodology: "five-w-two-h",
    task: "ground a non-trivial software task into an evidence-backed decision context before specification or implementation",
    audience: "agents and humans deciding how to change complex software systems",
    context: "Grounding uses authoritative task artifacts.",
    output_format: "A concise grounding brief.",
    validation: {
      checks: ["Operating frame is complete."],
      evidence: ["Decision tree and route evidence."],
    },
    method_fit: {
      best_when: "A vague task needs a complete operating frame",
      avoid_when: "The question is already narrow and only needs execution",
      reason: "Non-trivial software change needs a complete operating frame.",
    },
    human_review_stop: {
      stop_conditions: ["Stop when the grounding brief is complete."],
      human_approval_required: true,
      approval_actions: ["beginning specification"],
    },
  },
  selection: {
    methodology_name: "5W2H",
    method_ref: "references/five-w-two-h.md",
  },
};
const tgResult = renderMethodologySkill(tgCandidate);
check(
  "TG description pin matches Acceptance String",
  extractDescription(tgResult.files["SKILL.md"]) === TG_DESCRIPTION &&
    !tgResult.files["SKILL.md"].includes("## Fit"),
  extractDescription(tgResult.files["SKILL.md"]),
);

const tsCandidate = {
  skill_name: "test-ts-description-pin",
  skill_summary:
    "produce an evidence-backed four-file specification for one bounded software change",
  invocation: ["to-spec", "write the spec", "hand this off"],
  contract: {
    methodology: "work-breakdown-structure",
    task: "turn sufficiently resolved conversation and task context for one bounded software change into an evidence-backed, contradiction-audited, production-ready four-file specification",
    audience:
      "the implementation agent first; the human owner and independent spec reviewer second; and agents grounding later dependent tasks third",
    context: "Use resolved conversation and authoritative task artifacts.",
    output_format: "Four-file specification folder.",
    validation: {
      checks: ["Four files are saved."],
      evidence: ["Folder path and unverified-claim count."],
    },
    method_fit: {
      best_when:
        "The required four-file specification and ordered implementation work packages must be decomposed into independently reviewable deliverables",
      avoid_when:
        "The requested outcome is not this multi-deliverable specification cluster or cannot be decomposed without fabricating work",
      reason: "The deliverable is the four-file specification cluster.",
    },
    human_review_stop: {
      stop_conditions: ["Stop after reporting the saved spec."],
      human_approval_required: true,
      approval_actions: ["beginning implementation"],
    },
  },
  selection: {
    methodology_name: "Work Breakdown Structure",
    method_ref: "references/work-breakdown-structure.md",
  },
};
const tsResult = renderMethodologySkill(tsCandidate);
check(
  "TS description pin matches Acceptance String",
  extractDescription(tsResult.files["SKILL.md"]) === TS_DESCRIPTION &&
    !tsResult.files["SKILL.md"].includes("## Fit"),
  extractDescription(tsResult.files["SKILL.md"]),
);

const liveTg = fs.readFileSync(
  new URL("../../task-groundwork/SKILL.md", import.meta.url),
  "utf8",
);
const liveTs = fs.readFileSync(
  new URL("../../to-spec/SKILL.md", import.meta.url),
  "utf8",
);
check(
  "live task-groundwork description matches TG pin",
  extractDescription(liveTg) === TG_DESCRIPTION &&
    !liveTg.includes("## Fit") &&
    liveTg.includes("## Invocation") &&
    liveTg.includes("- start task N"),
  extractDescription(liveTg) || "missing description",
);
check(
  "live to-spec description matches TS pin",
  extractDescription(liveTs) === TS_DESCRIPTION &&
    !liveTs.includes("## Fit") &&
    liveTs.includes("## Invocation") &&
    liveTs.includes("- to-spec"),
  extractDescription(liveTs) || "missing description",
);

process.stdout.write(
  `${JSON.stringify({ passed: results.length, results }, null, 2)}\n`,
);
