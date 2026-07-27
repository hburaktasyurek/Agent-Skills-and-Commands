import fs from "node:fs";

export const COMMON_GOAL_LIMIT = 4000;
const manifestUrl = new URL(
  "../../methodology-selector/references/manifest.json",
  import.meta.url,
);
export const METHOD_MANIFEST = JSON.parse(
  fs.readFileSync(manifestUrl, "utf8"),
).methods;
export const SUPPORTED_METHODOLOGIES = new Set(
  METHOD_MANIFEST.map((method) => method.slug),
);

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const requireString = (input, field) => {
  if (!isNonEmptyString(input[field])) {
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

const optionalString = (input, field, omitted) => {
  if (!Object.hasOwn(input, field)) {
    omitted.push(field);
    return null;
  }
  if (!isNonEmptyString(input[field])) {
    throw new Error(`${field} must be a non-empty string when supplied`);
  }
  return input[field].trim();
};

const optionalPositiveInteger = (input, field, omitted) => {
  if (!Object.hasOwn(input, field)) {
    omitted.push(field);
    return null;
  }
  if (!Number.isInteger(input[field]) || input[field] <= 0) {
    throw new Error(`${field} must be a positive integer when supplied`);
  }
  return input[field];
};

const listSection = (label, items) =>
  `${label}:\n${items.map((item) => `- ${item}`).join("\n")}`;

export const countCharacters = (text) => Array.from(text).length;

export function renderGoal(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Goal input must be a JSON object");
  }

  const methodology = requireString(input, "methodology");
  if (!SUPPORTED_METHODOLOGIES.has(methodology)) {
    throw new Error(
      `Unsupported methodology: ${methodology}. Stop after methodology selection when it returns none.`,
    );
  }
  const task = requireString(input, "task");
  const audience = requireString(input, "audience");
  const context = requireString(input, "context");
  const outputFormat = requireString(input, "output_format");
  const boundaries = requireStringArray(input.boundaries, "boundaries");
  const fallback = requireString(input, "fallback");

  const validation = input.validation;
  if (!validation || typeof validation !== "object") {
    throw new Error("Missing required object: validation");
  }
  const validationChecks = requireStringArray(
    validation.checks,
    "validation.checks",
  );
  const validationEvidence = requireStringArray(
    validation.evidence,
    "validation.evidence",
  );

  const methodFit = input.method_fit;
  if (!methodFit || typeof methodFit !== "object") {
    throw new Error("Missing required object: method_fit");
  }
  const bestWhen = requireString(methodFit, "best_when");
  const avoidWhen = requireString(methodFit, "avoid_when");
  const fitReason = requireString(methodFit, "reason");

  const humanReviewStop = input.human_review_stop;
  if (!humanReviewStop || typeof humanReviewStop !== "object") {
    throw new Error("Missing required object: human_review_stop");
  }
  const stopConditions = requireStringArray(
    humanReviewStop.stop_conditions,
    "human_review_stop.stop_conditions",
  );
  if (typeof humanReviewStop.human_approval_required !== "boolean") {
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

  const hasTargetTool = Object.hasOwn(input, "target_tool");
  if (hasTargetTool && !isNonEmptyString(input.target_tool)) {
    throw new Error("target_tool must be a non-empty string when supplied");
  }
  const targetTool = hasTargetTool ? input.target_tool.trim() : "generic";
  const hasTargetLimit = Object.hasOwn(input, "target_limit");
  if (
    hasTargetLimit &&
    (!Number.isInteger(input.target_limit) ||
      input.target_limit <= 0 ||
      input.target_limit > COMMON_GOAL_LIMIT)
  ) {
    throw new Error(
      `target_limit must be a positive integer no greater than ${COMMON_GOAL_LIMIT}`,
    );
  }
  const limit = hasTargetLimit ? input.target_limit : COMMON_GOAL_LIMIT;

  const omitted = [];
  const hypothesis = optionalString(input, "hypothesis", omitted);
  const smallestUsefulRun = optionalString(
    input,
    "smallest_useful_run",
    omitted,
  );
  const independentChecker = optionalString(
    input,
    "independent_checker",
    omitted,
  );
  const discoverySource = optionalString(input, "discovery_source", omitted);
  const executionHandoff = optionalString(
    input,
    "execution_handoff",
    omitted,
  );
  const persistence = optionalString(input, "persistence", omitted);
  const schedulePolicy = optionalString(input, "schedule_policy", omitted);
  const budget = optionalString(input, "budget", omitted);
  const maxIterations = optionalPositiveInteger(
    input,
    "max_iterations",
    omitted,
  );
  const isolation = optionalString(input, "isolation", omitted);
  const feedbackPrompt = optionalString(input, "feedback_prompt", omitted);

  const sections = [
    `/goal ${task}`,
    `Methodology: ${methodology}`,
    `Audience: ${audience}`,
    `Context: ${context}`,
    `Output: ${outputFormat}`,
    `Method fit:\n- Best when: ${bestWhen}\n- Avoid when: ${avoidWhen}\n- Selection evidence: ${fitReason}`,
  ];

  if (hypothesis) {
    sections.push(`Design hypothesis: ${hypothesis}`);
  }
  if (smallestUsefulRun) {
    sections.push(`Smallest useful run: ${smallestUsefulRun}`);
  }
  if (discoverySource) {
    sections.push(`Discovery: ${discoverySource}`);
  }
  if (executionHandoff) {
    sections.push(`Execution handoff: ${executionHandoff}`);
  }

  sections.push(
    listSection("Validation", validationChecks),
    listSection("Evidence to surface", validationEvidence),
    listSection("Boundaries", boundaries),
  );

  if (independentChecker) {
    sections.push(`Independent checker: ${independentChecker}`);
  }
  if (isolation) {
    sections.push(`Isolation: ${isolation}`);
  }
  if (persistence) {
    sections.push(`Persistence: ${persistence}`);
  }
  if (schedulePolicy) {
    sections.push(`Schedule policy: ${schedulePolicy}`);
  }
  if (budget) {
    sections.push(`Budget: ${budget}`);
  }
  if (maxIterations !== null) {
    sections.push(`Maximum iterations: ${maxIterations}`);
  }

  sections.push(listSection("Stop conditions", stopConditions));

  if (humanReviewStop.human_approval_required) {
    sections.push(
      `Human approval: Required before ${approvalActions.join(", ")}.`,
    );
  } else {
    sections.push("Human approval: Not required by this goal contract.");
  }

  sections.push(`Fallback: ${fallback}`);
  if (feedbackPrompt) {
    sections.push(`Feedback: ${feedbackPrompt}`);
  }

  const goal = sections.join("\n\n");
  const characterCount = countCharacters(goal);

  return {
    goal,
    character_count: characterCount,
    limit,
    within_limit: characterCount <= limit,
    target_tool: targetTool,
    omitted_optional_fields: omitted,
  };
}
