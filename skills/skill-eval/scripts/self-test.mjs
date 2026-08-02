#!/usr/bin/env node

import assert from "node:assert/strict";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { computeEvalVerdict } from "./compute-eval-verdict.mjs";
import { hashSkillPackage } from "./hash-skill-package.mjs";
import {
  listAdapters,
  getAdapter,
  parseClaudeCode,
  parseCline,
  parseCodex,
  parseCursor,
  parseOpenCode,
} from "./harness-adapters.mjs";
import { protectedSkillSourceAccess, runHarnessEval } from "./run-harness-eval.mjs";
import { validateEvalDefinition, validateTriggerDefinition } from "./validate-eval-definition.mjs";

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = fs.realpathSync(execFileSync("git", ["-C", skillRoot, "rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim());
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const reference = (workspace, file) => ({ path: path.relative(workspace, file).split(path.sep).join("/"), sha256: sha256(fs.readFileSync(file)) });

const definition = JSON.parse(fs.readFileSync(path.join(skillRoot, "evals/evals.json"), "utf8"));
const triggers = JSON.parse(fs.readFileSync(path.join(skillRoot, "evals/trigger_queries.json"), "utf8"));
assert.equal(validateEvalDefinition(definition, { phase: "verify", baseDir: skillRoot }).valid, true);
assert.equal(validateTriggerDefinition(triggers).valid, true);

assert.deepEqual(listAdapters().map((item) => item.id), ["codex", "claude-code", "cursor", "opencode", "cline"]);
const codexArgs = getAdapter("codex").buildArgs({
  permission: "read-only",
  workspace: "/tmp/workspace",
  disabledSkillPaths: ["/tmp/global"],
});
assert.equal(codexArgs.some((item) => item.includes('path = "/tmp/global", enabled = false')), true);
assert.equal(getAdapter("codex").canDisableNamesakes, true);
assert.equal(getAdapter("codex").skillDirectory, ".agents/skills");
assert.equal(getAdapter("claude-code").buildArgs({ permission: "read-only" }).includes("plan"), true);
assert.equal(getAdapter("cursor").buildArgs({ permission: "read-only", prompt: "x" }).includes("--force"), false);
assert.equal(getAdapter("cursor").buildArgs({ permission: "workspace-write", prompt: "x" }).includes("--force"), true);
assert.equal(getAdapter("cursor").buildArgs({ permission: "workspace-write", prompt: "x" }).includes("--sandbox"), true);
assert.equal(getAdapter("cursor").safePermissions.has("workspace-write"), true);
assert.equal(JSON.parse(getAdapter("opencode").buildEnv({ permission: "read-only" }).OPENCODE_PERMISSION).edit, undefined);
assert.equal(JSON.parse(getAdapter("opencode").buildEnv({ permission: "workspace-write" }).OPENCODE_PERMISSION).edit, "allow");

const codex = parseCodex([
  JSON.stringify({ type: "thread.started", thread_id: "t1" }),
  JSON.stringify({ type: "turn.started" }),
  JSON.stringify({ type: "item.completed", item: { type: "agent_message", text: "done" } }),
  JSON.stringify({ type: "turn.completed", usage: { input_tokens: 8, cached_input_tokens: 2, output_tokens: 2, reasoning_output_tokens: 1 } }),
].join("\n"));
assert.equal(codex.valid, true);
assert.equal(codex.usage.total, 10);

const claude = parseClaudeCode([
  JSON.stringify({ type: "system", subtype: "init", session_id: "c1" }),
  JSON.stringify({ type: "result", is_error: false, result: "done", session_id: "c1", usage: { input_tokens: 7, output_tokens: 3 } }),
].join("\n"));
assert.equal(claude.valid, true);
assert.equal(claude.usage.total, 10);

const cursor = parseCursor([
  JSON.stringify({ type: "system", subtype: "init", session_id: "u1" }),
  JSON.stringify({ type: "result", subtype: "success", is_error: false, result: "done", session_id: "u1" }),
].join("\n"));
assert.equal(cursor.valid, true);
assert.equal(cursor.usage.status, "unavailable");

const opencode = parseOpenCode([
  JSON.stringify({ type: "text", part: { text: "working" } }),
  JSON.stringify({ type: "text", part: { text: "done" }, usage: { input: 6, output: 4 } }),
].join("\n"), { processCompleted: true });
assert.equal(opencode.valid, true);
assert.equal(opencode.usage.total, 10);

const cline = parseCline([
  JSON.stringify({ type: "say", text: "working", partial: false }),
  JSON.stringify({ type: "say", text: "done", partial: false }),
].join("\n"), { processCompleted: true });
assert.equal(cline.valid, true);
assert.equal(cline.usage.status, "unavailable");
assert.equal(parseCodex("not-json\n").valid, false);
assert.equal(parseClaudeCode(JSON.stringify({ type: "result", is_error: true, result: "failed" })).valid, false);
assert.equal(parseCursor(JSON.stringify({ type: "result", subtype: "error", is_error: true, result: "failed" })).valid, false);
assert.equal(parseOpenCode(JSON.stringify({ type: "text", part: { text: "progress" } })).valid, false);
assert.equal(parseCline(JSON.stringify({ type: "say", text: "progress", partial: false })).valid, false);
assert.equal(parseOpenCode(JSON.stringify({ type: "error", error: "failed" }), { processCompleted: true }).valid, false);
assert.equal(parseCline(JSON.stringify({ type: "ask", ask: "error", text: "failed" }), { processCompleted: true }).valid, false);
assert.equal(protectedSkillSourceAccess("clean", "/tmp/workspace", "/tmp/repo/skills/fixture-skill", null), null);
assert.equal(
  protectedSkillSourceAccess("read /tmp/repo/skills/fixture-skill/SKILL.md", "/tmp/workspace", "/tmp/repo/skills/fixture-skill", null),
  "/tmp/repo/skills/fixture-skill",
);

const minimalSummary = {
  schema_version: 2,
  subject: { name: "fixture-skill", path: "fixture", content_sha256: "a".repeat(64) },
  baseline: { mode: "without_skill" },
  surface: { adapter: "cursor", model: "fixture-model" },
  cases: {
    total: 3,
    results: ["primary", "edge", "scope"].map((id, index) => ({
      id,
      assertions: [{ passed: true }],
      grade: { baseline_score: 3, subject_score: index === 0 ? 4 : 3 },
    })),
  },
  trigger: { required: false, verdict: "NOT_RUN" },
  comparison: {
    regressions: 0,
    discriminating_lift: true,
    baseline: { usage: { status: "unavailable" } },
    subject: { usage: { status: "unavailable" } },
  },
};
assert.equal(computeEvalVerdict(minimalSummary, { expectedSubjectHash: "a".repeat(64), evidenceValidated: true }).verdict, "PASS");
assert.equal(computeEvalVerdict(minimalSummary, {
  expectedSubjectHash: "a".repeat(64),
  expectedCases: [
    { id: "wrong", assertions: ["wrong"] },
    { id: "edge", assertions: ["edge"] },
    { id: "scope", assertions: ["scope"] },
  ],
  evidenceValidated: true,
}).verdict, "INCONCLUSIVE");
const failed = structuredClone(minimalSummary);
failed.cases.results[1].assertions[0].passed = false;
assert.equal(computeEvalVerdict(failed, { expectedSubjectHash: "a".repeat(64), evidenceValidated: true }).verdict, "FAIL");
const noLift = structuredClone(minimalSummary);
noLift.cases.results[0].grade.subject_score = 3;
noLift.comparison.discriminating_lift = false;
assert.equal(computeEvalVerdict(noLift, { expectedSubjectHash: "a".repeat(64), evidenceValidated: true }).verdict, "NO_LIFT");
const missing = structuredClone(minimalSummary);
delete missing.surface.model;
assert.equal(computeEvalVerdict(missing, { expectedSubjectHash: "a".repeat(64), evidenceValidated: true }).verdict, "INCONCLUSIVE");
const triggerMissing = structuredClone(minimalSummary);
triggerMissing.trigger = { required: true, verdict: "NOT_RUN" };
assert.equal(computeEvalVerdict(triggerMissing, { expectedSubjectHash: "a".repeat(64), evidenceValidated: true }).verdict, "INCONCLUSIVE");
const triggerMissingWithFailedAssertion = structuredClone(triggerMissing);
triggerMissingWithFailedAssertion.cases.results[0].assertions[0].passed = false;
assert.equal(computeEvalVerdict(triggerMissingWithFailedAssertion, { expectedSubjectHash: "a".repeat(64), evidenceValidated: true }).verdict, "FAIL");
const triggerMissingWithRegression = structuredClone(triggerMissing);
triggerMissingWithRegression.cases.results[0].grade.subject_score = 2;
assert.equal(computeEvalVerdict(triggerMissingWithRegression, { expectedSubjectHash: "a".repeat(64), evidenceValidated: true }).verdict, "FAIL");

const runsRoot = path.join(repositoryRoot, ".skill-eval-runs");
fs.mkdirSync(runsRoot, { recursive: true });
const root = fs.mkdtempSync(path.join(runsRoot, "skill-eval-self-test-"));
try {
  const subject = path.join(root, "subject");
  fs.mkdirSync(subject);
  fs.writeFileSync(path.join(subject, "SKILL.md"), "---\nname: fixture-skill\ndescription: fixture\ndisable-model-invocation: true\n---\n\n# Fixture\n");
  const subjectEvals = path.join(subject, "evals");
  fs.mkdirSync(subjectEvals);
  const observedFile = path.join(subjectEvals, "observed.txt");
  fs.writeFileSync(observedFile, "observed edge fixture\n");
  writeJson(path.join(subjectEvals, "evals.json"), {
    skill_name: "fixture-skill",
    evals: [
      { id: "primary", prompt: "fixture prompt primary", expected_output: "primary output", files: [], metadata: { case_type: "primary", source: "synthetic" }, assertions: ["primary passes"] },
      { id: "edge", prompt: "fixture prompt edge", expected_output: "edge output", files: ["evals/observed.txt"], metadata: { case_type: "edge", source: "observed_failure", source_evidence: { path: "evals/observed.txt", sha256: sha256(fs.readFileSync(observedFile)), origin: { type: "observed_failure_record", locator: "self-test fixture", captured_at: "2026-08-02" } } }, assertions: ["edge passes"] },
      { id: "scope", prompt: "fixture prompt scope", expected_output: "scope output", files: [], metadata: { case_type: "scope_preservation", source: "synthetic" }, assertions: ["scope passes"] },
    ],
  });
  const subjectHash = hashSkillPackage(subject).content_sha256;
  const fakeCodex = path.join(root, "fake-codex.mjs");
  fs.writeFileSync(fakeCodex, `#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
if (process.argv.includes("--version")) { console.log("fake-codex 1.0"); process.exit(0); }
const workspaceIndex = process.argv.indexOf("-C");
const workspace = workspaceIndex === -1 ? null : process.argv[workspaceIndex + 1];
if (workspace && fs.existsSync(path.join(workspace, ".agents/skills/fixture-skill/evals"))) process.exit(9);
console.log(JSON.stringify({type:"thread.started",thread_id:"fixture"}));
console.log(JSON.stringify({type:"turn.started"}));
console.log(JSON.stringify({type:"item.completed",item:{type:"agent_message",text:"fixture output"}}));
console.log(JSON.stringify({type:"turn.completed",usage:{input_tokens:80,cached_input_tokens:20,output_tokens:20,reasoning_output_tokens:2}}));
`);
  fs.chmodSync(fakeCodex, 0o755);
  const evidence = path.join(root, "evidence");
  fs.mkdirSync(evidence);
  const runRecords = [];
  const results = [];
  const durations = { baseline: 0, subject: 0 };
  const usages = { baseline: [], subject: [] };
  for (const [index, id] of ["primary", "edge", "scope"].entries()) {
    const caseRoot = path.join(evidence, id);
    const assertionFile = path.join(caseRoot, "assertion.txt");
    const gradeFile = path.join(caseRoot, "grade.txt");
    fs.mkdirSync(caseRoot, { recursive: true });
    const pairTelemetry = {};
    for (const configuration of ["baseline", "subject"]) {
      const configurationRoot = path.join(caseRoot, configuration);
      const workspace = path.join(configurationRoot, "workspace");
      const trace = path.join(configurationRoot, "trace");
      fs.mkdirSync(workspace, { recursive: true });
      const promptFile = path.join(workspace, "prompt.txt");
      fs.writeFileSync(promptFile, `fixture prompt ${id}`);
      if (id === "edge") {
        const fixtureCopy = path.join(workspace, "evals/observed.txt");
        fs.mkdirSync(path.dirname(fixtureCopy), { recursive: true });
        fs.copyFileSync(observedFile, fixtureCopy);
      }
      const telemetry = await runHarnessEval({
        adapter: "codex",
        subjectPath: subject,
        workspace,
        traceDir: trace,
        promptFile,
        caseId: id,
        runId: `${id}-${configuration}`,
        configuration,
        model: "fixture-model",
        permission: "read-only",
        skillPath: configuration === "subject" ? subject : null,
        executable: fakeCodex,
      });
      assert.equal(telemetry.result, "completed");
      pairTelemetry[configuration] = telemetry;
      durations[configuration] += telemetry.run.duration_ms;
      usages[configuration].push(telemetry.usage);
      runRecords.push({ case_id: id, configuration, run_id: `${id}-${configuration}`, telemetry: reference(evidence, path.join(trace, "telemetry.json")) });
    }
    writeJson(assertionFile, {
      passed: true,
      subject_output_sha256: pairTelemetry.subject.artifacts.output_sha256,
      details: `assertion evidence ${id}`,
    });
    writeJson(gradeFile, {
      baseline_score: 3,
      subject_score: index === 0 ? 4 : 3,
      baseline_output_sha256: pairTelemetry.baseline.artifacts.output_sha256,
      subject_output_sha256: pairTelemetry.subject.artifacts.output_sha256,
      details: `blind grade evidence ${id}`,
    });
    results.push({
      id,
      assertions: [{ text: `${id} passes`, passed: true, evidence: reference(evidence, assertionFile) }],
      grade: { baseline_score: 3, subject_score: index === 0 ? 4 : 3, evidence: reference(evidence, gradeFile) },
    });
  }
  const aggregate = (items) => items.reduce((total, item) => ({
    status: "observed",
    input: total.input + item.input,
    cached_input: total.cached_input + item.cached_input,
    output: total.output + item.output,
    reasoning_output: total.reasoning_output + item.reasoning_output,
    total: total.total + item.total,
  }), { status: "observed", input: 0, cached_input: 0, output: 0, reasoning_output: 0, total: 0 });
  const summary = {
    schema_version: 2,
    subject: { name: "fixture-skill", path: subject, content_sha256: subjectHash },
    baseline: { mode: "without_skill" },
    surface: { adapter: "codex", model: "fixture-model" },
    cases: { total: results.length, results },
    trigger: { required: false, verdict: "NOT_RUN" },
    comparison: {
      regressions: 0,
      discriminating_lift: true,
      baseline: { duration_ms: durations.baseline, usage: aggregate(usages.baseline) },
      subject: { duration_ms: durations.subject, usage: aggregate(usages.subject) },
    },
    evidence: { workspace: evidence, runs: runRecords },
  };
  const summaryFile = path.join(evidence, "summary.json");
  writeJson(summaryFile, summary);
  const verdictScript = path.join(skillRoot, "scripts/compute-eval-verdict.mjs");
  const verdict = JSON.parse(execFileSync(process.execPath, [verdictScript, summaryFile, "--subject-path", subject], { encoding: "utf8" }));
  assert.equal(verdict.verdict, "INCONCLUSIVE", JSON.stringify(verdict));
  assert.match(verdict.reasons.join(" "), /test|identity|completion|evidence/i);
  fs.appendFileSync(path.join(subject, "SKILL.md"), "\n<!-- changed -->\n");
  const stale = JSON.parse(execFileSync(process.execPath, [verdictScript, summaryFile, "--subject-path", subject], { encoding: "utf8" }));
  assert.equal(stale.verdict, "INCONCLUSIVE");
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}

const hashRoot = fs.mkdtempSync(path.join(runsRoot, "skill-eval-hash-test-"));
try {
  fs.writeFileSync(path.join(hashRoot, "SKILL.md"), "---\nname: hash-test\ndescription: hash test\n---\n");
  const first = hashSkillPackage(hashRoot).content_sha256;
  assert.equal(hashSkillPackage(hashRoot).content_sha256, first);
  fs.writeFileSync(path.join(hashRoot, "reference.md"), "changed\n");
  assert.notEqual(hashSkillPackage(hashRoot).content_sha256, first);
} finally {
  fs.rmSync(hashRoot, { recursive: true, force: true });
}

process.stdout.write(`${JSON.stringify({ result: "DETERMINISTIC_PASS", skill: "skill-eval", adapters: listAdapters().length, fixtures: definition.evals.length })}\n`);
