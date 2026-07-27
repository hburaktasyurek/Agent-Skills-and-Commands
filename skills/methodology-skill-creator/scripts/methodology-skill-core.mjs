import fs from "node:fs";

const manifestUrl = new URL(
  "../../methodology-selector/references/manifest.json",
  import.meta.url,
);
export const METHOD_MANIFEST = JSON.parse(
  fs.readFileSync(manifestUrl, "utf8"),
).methods;
const METHODS = Object.fromEntries(
  METHOD_MANIFEST.map((method) => [
    method.slug,
    {
      displayName: method.name,
      methodRef: method.method_ref,
    },
  ]),
);

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const requireString = (input, field) => {
  if (!input || !isNonEmptyString(input[field])) {
    throw new Error(`Missing required string: ${field}`);
  }
  return input[field].trim();
};

const requireStringArray = (value, field) => {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.some((item) => !isNonEmptyString(item))
  ) {
    throw new Error(`Missing required string list: ${field}`);
  }
  return value.map((item) => item.trim());
};

const list = (items) => items.map((item) => `- ${item}`).join("\n");

const stripTitle = (markdown) => markdown.replace(/^# .+\n+/, "").trim();

export function renderMethodologySkill(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Creator input must be a JSON object");
  }

  const skillName = requireString(input, "skill_name");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(skillName)) {
    throw new Error("skill_name must be lowercase and hyphenated");
  }
  if (skillName === "methodology-skill-creator") {
    throw new Error("methodology-skill-creator cannot generate itself");
  }
  const existingSkillUrl = new URL(`../../${skillName}/SKILL.md`, import.meta.url);
  if (fs.existsSync(existingSkillUrl)) {
    throw new Error(`skill_name already exists in this skill collection: ${skillName}`);
  }

  const contract = input.contract;
  if (!contract || typeof contract !== "object" || Array.isArray(contract)) {
    throw new Error("Missing required object: contract");
  }
  const methodology = requireString(contract, "methodology");
  const method = METHODS[methodology];
  if (!method) {
    throw new Error(`Unsupported methodology: ${methodology}`);
  }

  const selection = input.selection;
  if (!selection || typeof selection !== "object") {
    throw new Error("Missing required object: selection");
  }
  const methodRef = requireString(selection, "method_ref");
  if (methodRef !== method.methodRef) {
    throw new Error(
      `method_ref mismatch: expected ${method.methodRef}, received ${methodRef}`,
    );
  }
  const methodologyName = requireString(selection, "methodology_name");
  if (methodologyName !== method.displayName) {
    throw new Error(
      `methodology_name mismatch: expected ${method.displayName}`,
    );
  }

  const task = requireString(contract, "task");
  const audience = requireString(contract, "audience");
  const context = requireString(contract, "context");
  const outputFormat = requireString(contract, "output_format");

  const validation = contract.validation;
  const validationChecks = requireStringArray(
    validation?.checks,
    "validation.checks",
  );
  const validationEvidence = requireStringArray(
    validation?.evidence,
    "validation.evidence",
  );

  const methodFit = contract.method_fit;
  const bestWhen = requireString(methodFit, "best_when");
  const avoidWhen = requireString(methodFit, "avoid_when");
  const fitReason = requireString(methodFit, "reason");

  const humanReviewStop = contract.human_review_stop;
  const stopConditions = requireStringArray(
    humanReviewStop?.stop_conditions,
    "human_review_stop.stop_conditions",
  );
  if (typeof humanReviewStop?.human_approval_required !== "boolean") {
    throw new Error(
      "Missing required boolean: human_review_stop.human_approval_required",
    );
  }
  if (
    humanReviewStop.human_approval_required === false &&
    Object.hasOwn(humanReviewStop, "approval_actions") &&
    (!Array.isArray(humanReviewStop.approval_actions) ||
      humanReviewStop.approval_actions.length > 0)
  ) {
    throw new Error(
      "approval_actions must be absent or empty when human approval is not required",
    );
  }
  const approvalActions = humanReviewStop.human_approval_required
    ? requireStringArray(
        humanReviewStop.approval_actions,
        "human_review_stop.approval_actions",
      )
    : [];

  const methodUrl = new URL(
    `../../methodology-selector/${methodRef}`,
    import.meta.url,
  );
  const methodBody = stripTitle(fs.readFileSync(methodUrl, "utf8"));
  const description =
    `Apply ${method.displayName} to ${task} for ${audience}. ` +
    `Use when this bounded task matches the recorded method fit; preserve ` +
    `validation and human-review conditions.`;

  const sections = [
    "---",
    `name: ${skillName}`,
    `description: ${JSON.stringify(description)}`,
    "---",
    "",
    `# ${method.displayName}: ${skillName}`,
    "",
    "## Assignment contract",
    "",
    `Methodology: ${method.displayName} (\`${methodology}\`)`,
    "",
    `Task: ${task}`,
    "",
    `Audience: ${audience}`,
    "",
    `Context: ${context}`,
    "",
    `Required output: ${outputFormat}`,
    "",
    "## Method fit",
    "",
    `- Best when: ${bestWhen}`,
    `- Avoid when: ${avoidWhen}`,
    `- Selection evidence: ${fitReason}`,
    "",
    "## Canonical method",
    "",
    methodBody,
    "",
    "## Validation",
    "",
    list(validationChecks),
    "",
    "Evidence to surface:",
    "",
    list(validationEvidence),
    "",
    "## Human review and stop",
    "",
    list(stopConditions),
    "",
    humanReviewStop.human_approval_required
      ? `Human approval is required before: ${approvalActions.join(", ")}.`
      : "Human approval is not required by this task contract.",
    "",
    "## Boundaries",
    "",
    `- Apply only ${method.displayName}; do not blend another methodology.`,
    "- Do not change the task contract to make validation easier.",
    "- Do not perform an approval action without the required human decision.",
    "- Stop when the task no longer matches the recorded method fit.",
  ];

  const skillMarkdown = sections.join("\n");
  const checks = {
    frontmatter_name_matches: skillMarkdown.startsWith(
      `---\nname: ${skillName}\n`,
    ),
    one_methodology: Object.keys(METHODS).filter((slug) =>
      skillMarkdown.includes(`Apply only ${METHODS[slug].displayName}`),
    ).length === 1,
    preserves_eight_fields:
      [
        methodologyName,
        methodology,
        task,
        audience,
        context,
        outputFormat,
        ...validationChecks,
        bestWhen,
        avoidWhen,
        fitReason,
        ...stopConditions,
      ].every((value) => skillMarkdown.includes(value)),
    validation_present:
      validationChecks.every((value) => skillMarkdown.includes(value)) &&
      validationEvidence.every((value) => skillMarkdown.includes(value)),
    human_return_present:
      stopConditions.every((value) => skillMarkdown.includes(value)) &&
      approvalActions.every((value) => skillMarkdown.includes(value)),
    canonical_method_sections_present:
      [
        "## Definition",
        "## Fit",
        "## Principles",
        "## Steps",
        "## Quality questions",
        "## Stop",
      ].every((heading) => skillMarkdown.includes(heading)),
  };

  if (Object.values(checks).some((passed) => !passed)) {
    throw new Error(`Generated skill failed checks: ${JSON.stringify(checks)}`);
  }

  return {
    skill_name: skillName,
    methodology,
    method_ref: methodRef,
    files: {
      "SKILL.md": skillMarkdown,
    },
    character_count: Array.from(skillMarkdown).length,
    checks,
  };
}
