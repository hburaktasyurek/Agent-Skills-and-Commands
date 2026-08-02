#!/usr/bin/env node

import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { parseAdapterOutput } from "./harness-adapters.mjs";
import { hashSkillPackage } from "./hash-skill-package.mjs";
import { validateEvalDefinition, validateTriggerDefinition } from "./validate-eval-definition.mjs";

const shaPattern = /^[a-f0-9]{64}$/;
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");

function terminal(verdict, reasons = []) {
  return {
    result: { PASS: "skill_eval_pass", FAIL: "skill_eval_fail", NO_LIFT: "no_lift", INCONCLUSIVE: "inconclusive" }[verdict],
    verdict,
    reasons,
  };
}

function nonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validUsage(value) {
  if (value?.status === "unavailable") return true;
  return value?.status === "observed" &&
    ["input", "cached_input", "output", "reasoning_output", "total"].every((key) => Number.isInteger(value[key]) && value[key] >= 0) &&
    value.cached_input <= value.input &&
    value.reasoning_output <= value.output &&
    value.total === value.input + value.output;
}

export function computeEvalVerdict(summary, {
  expectedSubjectHash,
  expectedBaselineHash = null,
  expectedCases = null,
  expectedTriggerRequired = null,
  evidenceValidated = false,
  triggerEvidenceValidated = false,
} = {}) {
  const missing = [];
  if (summary?.schema_version !== 2) missing.push("schema_version 2");
  if (!nonEmpty(summary?.subject?.name) || !nonEmpty(summary?.subject?.path)) missing.push("subject identity");
  if (!shaPattern.test(summary?.subject?.content_sha256 ?? "") || summary.subject.content_sha256 !== expectedSubjectHash) {
    missing.push("current subject package hash");
  }
  if (!new Set(["old_skill", "without_skill"]).has(summary?.baseline?.mode)) missing.push("baseline mode");
  if (summary?.baseline?.mode === "old_skill" && summary?.baseline?.content_sha256 !== expectedBaselineHash) {
    missing.push("exact old-skill baseline hash");
  }
  if (summary?.baseline?.mode === "without_skill" && summary?.baseline?.content_sha256 != null) {
    missing.push("without_skill baseline must not contain a package hash");
  }
  if (!nonEmpty(summary?.surface?.adapter) || !nonEmpty(summary?.surface?.model)) missing.push("adapter and model");
  if (!Array.isArray(summary?.cases?.results) || summary.cases.results.length < 3) missing.push("at least three case results");
  if (summary?.cases?.total !== summary?.cases?.results?.length) missing.push("case total");
  if (Array.isArray(expectedCases)) {
    const actual = summary?.cases?.results ?? [];
    if (
      actual.length !== expectedCases.length ||
      expectedCases.some((candidate, index) =>
        String(actual[index]?.id) !== String(candidate.id) ||
        JSON.stringify(actual[index]?.assertions?.map((assertion) => assertion.text)) !== JSON.stringify(candidate.assertions)
      )
    ) missing.push("cases and assertions matching current evals/evals.json");
  }
  if (typeof expectedTriggerRequired === "boolean" && summary?.trigger?.required !== expectedTriggerRequired) {
    missing.push("trigger requirement derived from the current skill package");
  }
  if (!evidenceValidated) missing.push("hashed run and grade evidence");
  if (missing.length) return terminal("INCONCLUSIVE", missing);

  const failed = [];
  for (const candidate of summary.cases.results) {
    if (!nonEmpty(String(candidate?.id ?? "")) || !Array.isArray(candidate?.assertions) || !candidate.assertions.length) {
      return terminal("INCONCLUSIVE", ["malformed case or assertion result"]);
    }
    if (candidate.assertions.some((assertion) => assertion?.passed === false)) failed.push(`case:${candidate.id}`);
    if (candidate.assertions.some((assertion) => typeof assertion?.passed !== "boolean")) {
      return terminal("INCONCLUSIVE", [`case:${candidate.id} has an ungraded assertion`]);
    }
  }
  if (!Number.isInteger(summary?.comparison?.regressions) || summary.comparison.regressions < 0) {
    return terminal("INCONCLUSIVE", ["comparison.regressions"]);
  }
  if (summary.comparison.regressions > 0) failed.push("regression");
  if (failed.length) return terminal("FAIL", [...new Set(failed)]);

  const grades = summary.cases.results.map((candidate) => candidate.grade);
  if (grades.some((grade) => !Number.isFinite(grade?.baseline_score) || !Number.isFinite(grade?.subject_score))) {
    return terminal("INCONCLUSIVE", ["paired artifact grades"]);
  }
  const qualityLift = grades.some((grade) => grade.subject_score > grade.baseline_score);
  const qualityRegression = grades.some((grade) => grade.subject_score < grade.baseline_score);
  if (qualityRegression) return terminal("FAIL", ["artifact quality regression"]);

  if (summary?.trigger?.required === true) {
    if (summary.trigger.verdict === "NOT_RUN") return terminal("INCONCLUSIVE", ["required trigger evaluation was not run"]);
    if (!triggerEvidenceValidated) return terminal("INCONCLUSIVE", ["native trigger evidence is not implemented by this MVP verifier"]);
    if (summary.trigger.verdict === "FAIL") return terminal("FAIL", ["trigger"]);
    if (summary.trigger.verdict !== "PASS") return terminal("INCONCLUSIVE", ["invalid trigger verdict"]);
  }

  const baselineUsage = summary?.comparison?.baseline?.usage;
  const subjectUsage = summary?.comparison?.subject?.usage;
  if (!validUsage(baselineUsage) || !validUsage(subjectUsage)) return terminal("INCONCLUSIVE", ["malformed usage telemetry"]);
  const tokenLift = baselineUsage?.status === "observed" && subjectUsage?.status === "observed" && subjectUsage.total < baselineUsage.total;
  const computedLift = qualityLift || tokenLift;
  if (summary?.comparison?.discriminating_lift !== computedLift) {
    return terminal("INCONCLUSIVE", ["discriminating_lift does not match observed grades or tokens"]);
  }
  return computedLift ? terminal("PASS") : terminal("NO_LIFT", ["baseline is equivalent"]);
}

function artifactResolver(repositoryRoot, workspace) {
  const allowedRoot = path.join(repositoryRoot, ".skill-proposals", ".eval-runs");
  const workspaceReal = fs.realpathSync(workspace);
  const allowedReal = fs.realpathSync(allowedRoot);
  const relative = path.relative(allowedReal, workspaceReal);
  if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("Evidence workspace is outside .skill-proposals/.eval-runs.");
  return (reference, label) => {
    if (!reference || !nonEmpty(reference.path) || !shaPattern.test(reference.sha256 ?? "") || path.isAbsolute(reference.path)) {
      throw new Error(`${label} reference is malformed.`);
    }
    const absolute = path.resolve(workspaceReal, reference.path);
    const inside = path.relative(workspaceReal, absolute);
    if (inside.startsWith("..") || path.isAbsolute(inside)) throw new Error(`${label} escapes the evidence workspace.`);
    if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) throw new Error(`${label} file is missing.`);
    const absoluteReal = fs.realpathSync(absolute);
    const realInside = path.relative(workspaceReal, absoluteReal);
    if (realInside.startsWith("..") || path.isAbsolute(realInside)) throw new Error(`${label} resolves outside the evidence workspace.`);
    const body = fs.readFileSync(absoluteReal);
    if (sha256(body) !== reference.sha256) throw new Error(`${label} hash mismatch.`);
    return { absolute: absoluteReal, body, text: body.toString("utf8") };
  };
}

export function validateEvidence(summary, resolve, expectedCases = []) {
  if (!Array.isArray(summary?.evidence?.runs) || summary.evidence.runs.length !== summary.cases.results.length * 2) {
    throw new Error("Expected one baseline and one subject run per case.");
  }
  const byCase = new Map();
  const definitions = new Map(expectedCases.map((candidate) => [String(candidate.id), candidate]));
  const seenTelemetry = new Set();
  const seenRunIds = new Set();
  let baselineDuration = 0;
  let subjectDuration = 0;
  const usage = { baseline: [], subject: [] };
  for (const record of summary.evidence.runs) {
    if (!new Set(["baseline", "subject"]).has(record?.configuration)) throw new Error("Unknown run configuration.");
    const telemetryArtifact = resolve(record.telemetry, "Telemetry");
    if (seenTelemetry.has(telemetryArtifact.absolute)) throw new Error("A telemetry trace cannot be reused across cases.");
    seenTelemetry.add(telemetryArtifact.absolute);
    const telemetry = JSON.parse(telemetryArtifact.text);
    if (
      telemetry?.schema_version !== 2 ||
      telemetry?.runner !== "skill-eval/harness" ||
      telemetry?.result !== "completed" ||
      telemetry?.adapter?.test_override !== false ||
      telemetry?.adapter?.safety_enforced !== true ||
      telemetry?.adapter?.id !== summary.surface.adapter ||
      telemetry?.run?.model !== summary.surface.model ||
      telemetry?.run?.case_id !== String(record.case_id) ||
      telemetry?.run?.configuration !== record.configuration ||
      telemetry?.prompt?.sha256 !== sha256(definitions.get(String(record.case_id))?.prompt ?? "") ||
      telemetry?.fixture_sha256 !== definitions.get(String(record.case_id))?.fixture_sha256 ||
      telemetry?.subject?.before_sha256 !== summary.subject.content_sha256 ||
      telemetry?.subject?.after_sha256 !== summary.subject.content_sha256 ||
      telemetry?.subject?.unchanged !== true ||
      !validUsage(telemetry?.usage)
    ) throw new Error("Telemetry identity or completion data does not match the result.");
    if (!nonEmpty(record?.run_id) || telemetry.run.id !== record.run_id || seenRunIds.has(record.run_id)) {
      throw new Error("Run identities must be unique and match telemetry.");
    }
    seenRunIds.add(record.run_id);
    const raw = resolve({ path: path.posix.join(path.posix.dirname(record.telemetry.path), telemetry.artifacts.events), sha256: telemetry.stream.sha256 }, "Raw event stream");
    const finalMessage = resolve({ path: path.posix.join(path.posix.dirname(record.telemetry.path), telemetry.artifacts.final_message), sha256: telemetry.artifacts.final_message_sha256 }, "Final message");
    const parsed = parseAdapterOutput(summary.surface.adapter, raw.text, { processCompleted: true });
    if (
      !parsed.valid ||
      parsed.final_message !== finalMessage.text ||
      parsed.event_count !== telemetry.stream.event_count ||
      JSON.stringify(parsed.usage) !== JSON.stringify(telemetry.usage)
    ) {
      throw new Error("Raw event stream does not reproduce telemetry.");
    }
    const expectedSkill = record.configuration === "subject"
      ? summary.subject.content_sha256
      : summary.baseline.mode === "old_skill" ? summary.baseline.content_sha256 : null;
    if (telemetry?.skill?.before_sha256 !== expectedSkill || telemetry?.skill?.after_sha256 !== expectedSkill) {
      throw new Error("Run used the wrong skill package.");
    }
    const expectedProjectionExclusions = expectedSkill ? ["evals"] : [];
    if (JSON.stringify(telemetry?.skill?.runtime_projection_excluded) !== JSON.stringify(expectedProjectionExclusions)) {
      throw new Error("Runtime skill projection did not exclude eval answer material.");
    }
    const key = String(record.case_id);
    const pair = byCase.get(key) ?? {};
    if (pair[record.configuration]) throw new Error("Duplicate case configuration.");
    pair[record.configuration] = telemetry;
    byCase.set(key, pair);
    if (record.configuration === "baseline") baselineDuration += telemetry.run.duration_ms;
    else subjectDuration += telemetry.run.duration_ms;
    usage[record.configuration].push(telemetry.usage);
  }
  for (const candidate of summary.cases.results) {
    const pair = byCase.get(String(candidate.id));
    if (!pair?.baseline || !pair?.subject) throw new Error(`Missing run pair for case ${candidate.id}.`);
    if (
      pair.baseline.prompt.sha256 !== pair.subject.prompt.sha256 ||
      pair.baseline.input_snapshot_sha256 !== pair.subject.input_snapshot_sha256 ||
      pair.baseline.run.permission !== pair.subject.run.permission ||
      pair.baseline.run.host !== pair.subject.run.host ||
      pair.baseline.run.timeout_ms !== pair.subject.run.timeout_ms ||
      pair.baseline.run.max_output_bytes !== pair.subject.run.max_output_bytes ||
      pair.baseline.executor.path !== pair.subject.executor.path ||
      pair.baseline.executor.version !== pair.subject.executor.version
    ) {
      throw new Error(`Case ${candidate.id} did not use the same prompt, fixture, harness version, and permissions.`);
    }
    const baselineOutput = resolve({
      path: path.posix.join(path.posix.dirname(summary.evidence.runs.find((item) => String(item.case_id) === String(candidate.id) && item.configuration === "baseline").telemetry.path), pair.baseline.artifacts.output),
      sha256: pair.baseline.artifacts.output_sha256,
    }, `Baseline output ${candidate.id}`);
    const subjectOutput = resolve({
      path: path.posix.join(path.posix.dirname(summary.evidence.runs.find((item) => String(item.case_id) === String(candidate.id) && item.configuration === "subject").telemetry.path), pair.subject.artifacts.output),
      sha256: pair.subject.artifacts.output_sha256,
    }, `Subject output ${candidate.id}`);
    JSON.parse(baselineOutput.text);
    JSON.parse(subjectOutput.text);
    for (const assertion of candidate.assertions) {
      const evidence = JSON.parse(resolve(assertion.evidence, `Assertion ${candidate.id}`).text);
      if (
        evidence?.passed !== assertion.passed ||
        evidence?.subject_output_sha256 !== pair.subject.artifacts.output_sha256 ||
        !nonEmpty(evidence?.details)
      ) throw new Error(`Assertion ${candidate.id} is not bound to the subject artifact.`);
    }
    const grade = JSON.parse(resolve(candidate.grade.evidence, `Grade ${candidate.id}`).text);
    if (
      grade?.baseline_score !== candidate.grade.baseline_score ||
      grade?.subject_score !== candidate.grade.subject_score ||
      grade?.baseline_output_sha256 !== pair.baseline.artifacts.output_sha256 ||
      grade?.subject_output_sha256 !== pair.subject.artifacts.output_sha256 ||
      !nonEmpty(grade?.details)
    ) throw new Error(`Grade ${candidate.id} is not bound to the paired artifacts.`);
  }
  const aggregateUsage = (items) => {
    if (items.some((item) => item.status !== "observed")) return { status: "unavailable" };
    return items.reduce((total, item) => ({
      status: "observed",
      input: total.input + item.input,
      cached_input: total.cached_input + item.cached_input,
      output: total.output + item.output,
      reasoning_output: total.reasoning_output + item.reasoning_output,
      total: total.total + item.total,
    }), { status: "observed", input: 0, cached_input: 0, output: 0, reasoning_output: 0, total: 0 });
  };
  if (summary.comparison.baseline.duration_ms !== baselineDuration || summary.comparison.subject.duration_ms !== subjectDuration) {
    throw new Error("Duration aggregate mismatch.");
  }
  if (JSON.stringify(summary.comparison.baseline.usage) !== JSON.stringify(aggregateUsage(usage.baseline)) || JSON.stringify(summary.comparison.subject.usage) !== JSON.stringify(aggregateUsage(usage.subject))) {
    throw new Error("Usage aggregate mismatch.");
  }
  return true;
}

function frontmatterName(subjectPath) {
  return fs.readFileSync(path.join(subjectPath, "SKILL.md"), "utf8").match(/^name:\s*([^\n#]+?)\s*$/m)?.[1]?.trim() ?? null;
}

function explicitOnly(subjectPath) {
  const skill = fs.readFileSync(path.join(subjectPath, "SKILL.md"), "utf8");
  const openai = path.join(subjectPath, "agents/openai.yaml");
  return /^disable-model-invocation:\s*true\s*$/m.test(skill) ||
    (fs.existsSync(openai) && /^\s*allow_implicit_invocation:\s*false\s*$/m.test(fs.readFileSync(openai, "utf8")));
}

function caseDefinitions(subjectPath, definition) {
  return definition.evals.map((candidate) => {
    const fixtures = candidate.files.map((relative) => ({
      path: relative.split(path.sep).join("/"),
      sha256: sha256(fs.readFileSync(path.join(subjectPath, relative))),
    }));
    return { ...candidate, fixture_sha256: sha256(JSON.stringify(fixtures)) };
  });
}

function main() {
  const [summaryFile, ...args] = process.argv.slice(2);
  const value = (flag) => {
    const index = args.indexOf(flag);
    return index === -1 ? null : args[index + 1];
  };
  const subjectInput = value("--subject-path");
  if (!summaryFile || !subjectInput) {
    console.error("Usage: compute-eval-verdict.mjs <run-summary.json> --subject-path <subject> [--baseline-path <old-skill>]");
    process.exit(2);
  }
  try {
    const summary = JSON.parse(fs.readFileSync(summaryFile, "utf8"));
    const subjectPath = fs.realpathSync(subjectInput);
    if (fs.realpathSync(summary?.subject?.path ?? "") !== subjectPath) throw new Error("Result subject path does not match --subject-path.");
    const expectedSubjectHash = hashSkillPackage(subjectPath).content_sha256;
    const definition = JSON.parse(fs.readFileSync(path.join(subjectPath, "evals/evals.json"), "utf8"));
    const definitionValidation = validateEvalDefinition(definition, { phase: "verify", baseDir: subjectPath });
    if (!definitionValidation.valid) throw new Error(`Current eval definition is invalid: ${definitionValidation.errors.join("; ")}`);
    if (definition.skill_name !== frontmatterName(subjectPath) || summary.subject.name !== definition.skill_name) {
      throw new Error("Subject name does not match SKILL.md and evals/evals.json.");
    }
    const expectedTriggerRequired = !explicitOnly(subjectPath);
    if (expectedTriggerRequired) {
      const triggerDefinition = JSON.parse(fs.readFileSync(path.join(subjectPath, "evals/trigger_queries.json"), "utf8"));
      const triggerValidation = validateTriggerDefinition(triggerDefinition);
      if (!triggerValidation.valid || triggerDefinition.skill_name !== definition.skill_name) {
        throw new Error(`Current trigger definition is invalid: ${triggerValidation.errors.join("; ")}`);
      }
    }
    let expectedBaselineHash = null;
    let baselinePath = null;
    if (summary?.baseline?.mode === "old_skill") {
      const baselineInput = value("--baseline-path");
      if (!baselineInput) throw new Error("Old-skill baseline path is required.");
      baselinePath = fs.realpathSync(baselineInput);
      expectedBaselineHash = hashSkillPackage(baselinePath).content_sha256;
      if (frontmatterName(baselinePath) !== definition.skill_name || path.basename(baselinePath) !== expectedBaselineHash) {
        throw new Error("Old-skill baseline must be the same skill in a content-addressed snapshot directory.");
      }
    }
    const repositoryRoot = fs.realpathSync(execFileSync("git", ["-C", subjectPath, "rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim());
    const resolve = artifactResolver(repositoryRoot, summary?.evidence?.workspace ?? "");
    let evidenceValidated = false;
    try {
      evidenceValidated = validateEvidence(summary, resolve, caseDefinitions(subjectPath, definition));
    } catch (error) {
      process.stdout.write(`${JSON.stringify(terminal("INCONCLUSIVE", [`evidence: ${error.message}`]), null, 2)}\n`);
      return;
    }
    const currentHashAfterEvidence = hashSkillPackage(subjectPath).content_sha256;
    const baselineHashAfterEvidence = baselinePath ? hashSkillPackage(baselinePath).content_sha256 : null;
    process.stdout.write(`${JSON.stringify(computeEvalVerdict(summary, {
      expectedSubjectHash: currentHashAfterEvidence === expectedSubjectHash ? expectedSubjectHash : null,
      expectedBaselineHash: baselinePath && baselineHashAfterEvidence !== expectedBaselineHash ? null : expectedBaselineHash,
      expectedCases: caseDefinitions(subjectPath, definition),
      expectedTriggerRequired,
      evidenceValidated,
    }), null, 2)}\n`);
  } catch (error) {
    process.stdout.write(`${JSON.stringify(terminal("INCONCLUSIVE", [error.message]), null, 2)}\n`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
