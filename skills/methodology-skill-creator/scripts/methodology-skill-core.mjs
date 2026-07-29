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

export const SKILL_SUMMARY_LIMIT = 160;
export const DESCRIPTION_LIMIT = 400;
export const ALIAS_LIMIT = 48;
export const TRIGGERS_IN_DESCRIPTION = 3;

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

const countCharacters = (value) => Array.from(value).length;

const escapeRegExp = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Lowercase the first character for mid-sentence glue unless it looks like an
 * acronym (two or more leading uppercase letters, e.g. "API", "5W2H").
 */
export function decapitalizeForGlue(s) {
  if (/^[A-Z]{2,}([^a-z]|$)/.test(s)) return s;
  if (/^[A-Z]/.test(s)) return s[0].toLowerCase() + s.slice(1);
  return s;
}

/** Normalize discovery strings: trim, collapse whitespace, strip trailing `.`, reject newlines. */
export function normalizeDiscoveryString(value, field) {
  if (typeof value !== "string") {
    throw new Error(`Missing required string: ${field}`);
  }
  if (/[\r\n]/.test(value)) {
    throw new Error(`newline rejected in ${field}`);
  }
  let normalized = value.trim().replace(/\s+/g, " ");
  if (normalized.endsWith(".")) {
    normalized = normalized.slice(0, -1).trimEnd();
  }
  if (!normalized) {
    throw new Error(`Missing required string: ${field}`);
  }
  return normalized;
}

const stripTitleAndExternalSource = (markdown) =>
  markdown
    .replace(/^# .+\n+/, "")
    .replace(/^Source:\s+\[[^\]]+\]\(https?:\/\/[^)]+\)\n+/, "")
    .trim();

/** Remove the canonical ## Fit section; keep Definition / Principles / Steps / Quality / Stop. */
export function stripFitSection(methodBody) {
  return methodBody
    .replace(/(?:^|\n)## Fit\n[\s\S]*?(?=(?:\n## )|$)/g, "\n")
    .replace(/^\n+/, "")
    .trim();
}

function buildDescription(methodDisplayName, skillSummary, bestWhen, aliases) {
  let description =
    `Apply ${methodDisplayName} to ${skillSummary}. Use when ${bestWhen}.`;
  if (aliases.length > 0) {
    const triggerAliases = aliases.slice(0, TRIGGERS_IN_DESCRIPTION);
    description += ` Triggers: ${triggerAliases.join("; ")}.`;
  }
  return description;
}

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

  const skillSummaryRaw = normalizeDiscoveryString(
    input.skill_summary,
    "skill_summary",
  );
  for (const method of METHOD_MANIFEST) {
    const pattern = new RegExp(
      `^Apply\\s+${escapeRegExp(method.name)}\\s+to\\b`,
      "i",
    );
    if (pattern.test(skillSummaryRaw)) {
      throw new Error(
        "skill_summary must not contain a nested Apply-formula (Apply {Methodology} to …)",
      );
    }
  }
  const skillSummary = decapitalizeForGlue(skillSummaryRaw);
  if (countCharacters(skillSummary) > SKILL_SUMMARY_LIMIT) {
    throw new Error(
      `skill_summary exceeds ${SKILL_SUMMARY_LIMIT} characters`,
    );
  }

  let invocationAliases = [];
  if (Object.hasOwn(input, "invocation")) {
    if (
      !Array.isArray(input.invocation) ||
      input.invocation.length === 0 ||
      input.invocation.some((item) => typeof item !== "string")
    ) {
      throw new Error("invocation must be a non-empty string list when present");
    }
    invocationAliases = input.invocation.map((alias, index) => {
      const normalized = normalizeDiscoveryString(alias, `invocation[${index}]`);
      if (countCharacters(normalized) > ALIAS_LIMIT) {
        throw new Error(
          `invocation alias exceeds ${ALIAS_LIMIT} characters: ${normalized}`,
        );
      }
      return normalized;
    });
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
  const bestWhenRaw = requireString(methodFit, "best_when");
  const avoidWhen = requireString(methodFit, "avoid_when");
  const fitReason = requireString(methodFit, "reason");
  const bestWhen = decapitalizeForGlue(
    normalizeDiscoveryString(bestWhenRaw, "method_fit.best_when"),
  );

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

  const description = buildDescription(
    method.displayName,
    skillSummary,
    bestWhen,
    invocationAliases,
  );
  if (countCharacters(description) > DESCRIPTION_LIMIT) {
    throw new Error(
      `description exceeds ${DESCRIPTION_LIMIT} characters`,
    );
  }
  const expectedPrefix = `Apply ${method.displayName} to ${skillSummary}. Use when ${bestWhen}.`;
  if (
    !description.startsWith(expectedPrefix) ||
    description.includes(` for ${audience}`) ||
    description.includes(
      "Follow the embedded method, validation, and human-stop rules.",
    )
  ) {
    throw new Error(
      "description must not leak audience, contract.task, or embedded-method boilerplate",
    );
  }

  const methodUrl = new URL(
    `../../methodology-selector/${methodRef}`,
    import.meta.url,
  );
  const methodBody = stripFitSection(
    stripTitleAndExternalSource(fs.readFileSync(methodUrl, "utf8")),
  );

  const sections = [
    "---",
    `name: ${skillName}`,
    `description: ${JSON.stringify(description)}`,
    "---",
    "",
    `# ${skillName}`,
    "",
    "## Objective",
    "",
    `Apply ${method.displayName} (\`${methodology}\`) to this job: ${task}`,
    "",
    `Produce the result for ${audience}.`,
    "",
    "## Operating instructions",
    "",
    context,
    "",
    "## Required deliverable",
    "",
    outputFormat,
    "",
    "## When to use",
    "",
    `- Use when: ${bestWhen}`,
    `- Do not use when: ${avoidWhen}`,
    `- Why ${method.displayName}: ${fitReason}`,
  ];

  if (invocationAliases.length > 0) {
    sections.push("", "## Invocation", "", list(invocationAliases));
  }

  sections.push(
    "",
    "## Workflow",
    "",
    `Apply this ${method.displayName} procedure while executing the job:`,
    "",
    methodBody,
    "",
    "## Execution checks",
    "",
    list(validationChecks),
    "",
    "## Evidence to return",
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
  );

  const skillMarkdown = `${sections.join("\n")}\n`;
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
        "## Principles",
        "## Steps",
        "## Quality questions",
        "## Stop",
      ].every((heading) => skillMarkdown.includes(heading)) &&
      !skillMarkdown.includes("## Fit"),
    operational_skill_structure:
      [
        "## Objective",
        "## Operating instructions",
        "## Required deliverable",
        "## When to use",
        "## Workflow",
        "## Execution checks",
        "## Evidence to return",
        "## Human review and stop",
      ].every((heading) => skillMarkdown.includes(heading)) &&
      ![
        "## Assignment contract",
        "\nTask: ",
        "\nAudience: ",
        "\nContext: ",
        "\nRequired output: ",
        "## Method fit",
        "Selection evidence:",
      ].some((marker) => skillMarkdown.includes(marker)),
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
