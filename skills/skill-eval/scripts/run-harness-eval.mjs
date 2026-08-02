#!/usr/bin/env node

import crypto from "node:crypto";
import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { getAdapter, listAdapters } from "./harness-adapters.mjs";
import { hashSkillPackage } from "./hash-skill-package.mjs";

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");

function inside(root, target) {
  const relative = path.relative(root, target);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function overlaps(left, right) {
  return inside(left, right) || inside(right, left);
}

function value(args, flag, fallback = null) {
  const index = args.indexOf(flag);
  return index === -1 ? fallback : args[index + 1];
}

function resolveExecutable(command) {
  const candidate = command.includes(path.sep)
    ? path.resolve(command)
    : execFileSync("which", [command], { encoding: "utf8" }).trim();
  return fs.realpathSync(candidate);
}

function snapshot(root, current = root) {
  const files = [];
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === ".skill-eval") continue;
    const absolute = path.join(current, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Workspace symlink is not allowed: ${absolute}`);
    if (entry.isDirectory()) files.push(...snapshot(root, absolute));
    if (entry.isFile()) {
      const body = fs.readFileSync(absolute);
      files.push({
        path: path.relative(root, absolute).split(path.sep).join("/"),
        sha256: sha256(body),
        size: body.length,
      });
    }
  }
  return files.sort((left, right) => left.path.localeCompare(right.path));
}

function gitIdentity(workspace) {
  try {
    const head = execFileSync("git", ["-C", workspace, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
    const status = execFileSync("git", ["-C", workspace, "status", "--porcelain=v1", "--untracked-files=all"], { encoding: "utf8" });
    const index = execFileSync("git", ["-C", workspace, "ls-files", "--stage", "-z"]);
    return sha256(Buffer.concat([Buffer.from(`${head}\n${status}\n`, "utf8"), index]));
  } catch {
    return null;
  }
}

function canonicalCase(subjectPath, caseId, workspace, prompt) {
  const definition = JSON.parse(fs.readFileSync(path.join(subjectPath, "evals/evals.json"), "utf8"));
  const candidate = definition.evals?.find((item) => String(item.id) === String(caseId));
  if (!candidate) throw new Error(`Unknown canonical eval case: ${caseId}`);
  if (prompt !== candidate.prompt) throw new Error(`Prompt does not match canonical eval case ${caseId}.`);
  const fixtures = (candidate.files ?? []).map((relative) => {
    const source = path.join(subjectPath, relative);
    const copy = path.join(workspace, relative);
    if (!fs.existsSync(copy) || !fs.statSync(copy).isFile()) throw new Error(`Missing canonical fixture copy: ${relative}`);
    const sourceHash = sha256(fs.readFileSync(source));
    const copyHash = sha256(fs.readFileSync(copy));
    if (sourceHash !== copyHash) throw new Error(`Fixture copy differs from the canonical package file: ${relative}`);
    return { path: relative.split(path.sep).join("/"), sha256: sourceHash };
  });
  return { id: String(candidate.id), fixture_sha256: sha256(JSON.stringify(fixtures)) };
}

function artifact(before, after, workspace, finalMessage, git) {
  const previous = new Map(before.map((item) => [item.path, item]));
  const current = new Map(after.map((item) => [item.path, item]));
  const changes = [];
  for (const relative of [...new Set([...previous.keys(), ...current.keys()])].sort()) {
    const left = previous.get(relative);
    const right = current.get(relative);
    if (left?.sha256 === right?.sha256) continue;
    if (!right) {
      changes.push({ path: relative, status: "deleted", before_sha256: left.sha256 });
      continue;
    }
    const body = fs.readFileSync(path.join(workspace, relative));
    changes.push({
      path: relative,
      status: left ? "modified" : "created",
      before_sha256: left?.sha256 ?? null,
      after_sha256: right.sha256,
      content_base64: body.toString("base64"),
    });
  }
  return { schema_version: 1, final_message: finalMessage, changes, git };
}

function runProcess(command, args, { cwd, input, timeoutMs, maxOutputBytes, env }) {
  return new Promise((resolve) => {
    const started = process.hrtime.bigint();
    const child = spawn(command, args, {
      cwd,
      env: { ...Object.fromEntries(Object.entries(process.env).filter(([key]) => new Set([
        "HOME", "LANG", "LC_ALL", "LOGNAME", "NO_COLOR", "PATH", "SHELL", "SSL_CERT_DIR", "SSL_CERT_FILE", "TERM", "TMPDIR", "USER",
      ]).has(key)).concat([["NO_COLOR", "1"]])), ...env },
      stdio: ["pipe", "pipe", "pipe"],
    });
    const stdout = [];
    const stderr = [];
    let outputBytes = 0;
    let limitExceeded = false;
    let timedOut = false;
    const collect = (bucket) => (chunk) => {
      outputBytes += chunk.length;
      if (outputBytes > maxOutputBytes) {
        limitExceeded = true;
        child.kill("SIGTERM");
        return;
      }
      bucket.push(chunk);
    };
    child.stdout.on("data", collect(stdout));
    child.stderr.on("data", collect(stderr));
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
    }, timeoutMs);
    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({ exitCode: null, signal: null, stdout: "", stderr: error.message, timedOut, limitExceeded, durationMs: Number(process.hrtime.bigint() - started) / 1e6 });
    });
    child.on("close", (exitCode, signal) => {
      clearTimeout(timer);
      resolve({
        exitCode,
        signal,
        stdout: Buffer.concat(stdout).toString("utf8"),
        stderr: Buffer.concat(stderr).toString("utf8"),
        timedOut,
        limitExceeded,
        durationMs: Math.round(Number(process.hrtime.bigint() - started) / 1e6),
      });
    });
    child.stdin.end(input ?? "");
  });
}

function skillName(skillPath) {
  const text = fs.readFileSync(path.join(skillPath, "SKILL.md"), "utf8");
  return text.match(/^name:\s*([^\n#]+?)\s*$/m)?.[1]?.trim() ?? path.basename(skillPath);
}

function installedNamesakes(adapterId, workspace, name, enabledSkillPath) {
  const home = process.env.HOME ? path.resolve(process.env.HOME) : null;
  const relativeRoots = {
    codex: [".codex/skills", ".agents/skills"],
    "claude-code": [".claude/skills", ".agents/skills"],
    cursor: [".cursor/skills", ".agents/skills"],
    opencode: [".opencode/skills", ".claude/skills", ".agents/skills"],
    cline: [".cline/skills", ".clinerules/skills", ".claude/skills"],
  }[adapterId] ?? [];
  const roots = relativeRoots.flatMap((relative) => [home && path.join(home, relative), path.join(workspace, relative)]).filter(Boolean);
  const enabledReal = enabledSkillPath ? fs.realpathSync(enabledSkillPath) : null;
  return roots
    .map((root) => path.join(root, name))
    .filter((candidate) => fs.existsSync(path.join(candidate, "SKILL.md")))
    .map((candidate) => fs.realpathSync(candidate))
    .filter((candidate) => candidate !== enabledReal);
}

export function protectedSkillSourceAccess(raw, workspace, subjectPath, skillPath, namesakes = []) {
  const name = fs.existsSync(path.join(subjectPath, "SKILL.md")) ? skillName(subjectPath) : path.basename(subjectPath);
  let repositoryRoot = null;
  try {
    repositoryRoot = fs.realpathSync(execFileSync("git", ["-C", subjectPath, "rev-parse", "--show-toplevel"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim());
  } catch {}
  const candidates = new Set([subjectPath, skillPath, ...namesakes].filter(Boolean).map((candidate) => path.resolve(candidate)));
  if (repositoryRoot) {
    candidates.add(path.join(repositoryRoot, "skills", name));
    candidates.add(path.join(repositoryRoot, ".skill-proposals", name));
  }
  return [...candidates]
    .filter((candidate) => !inside(workspace, candidate))
    .find((candidate) => raw.includes(candidate)) ?? null;
}

function prepareProjection(adapter, workspace, skillPath, originalPrompt) {
  if (!skillPath && adapter.projection === "prompt_context") {
    return {
      prompt: `No skill package is provided for this control run. Do not search for or load any skill package, and use only files inside the workspace.\n\n${originalPrompt}`,
      cleanup: () => {},
      mode: "prompt_context_control",
      path: null,
      excluded: [],
    };
  }
  if (!skillPath) return { prompt: originalPrompt, cleanup: () => {}, mode: "none", path: null, excluded: [] };
  const copyRuntimePackage = (destination) => fs.cpSync(skillPath, destination, {
    recursive: true,
    errorOnExist: true,
    filter: (source) => path.relative(skillPath, source).split(path.sep)[0] !== "evals",
  });
  if (adapter.projection === "prompt_context") {
    const destination = path.join(workspace, ".skill-eval", "subject");
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    copyRuntimePackage(destination);
    return {
      prompt: `Apply the skill package at ${destination} to the following task.\n\n${originalPrompt}`,
      cleanup: () => fs.rmSync(path.join(workspace, ".skill-eval"), { recursive: true, force: true }),
      mode: "prompt_context",
      path: destination,
      excluded: ["evals"],
    };
  }
  if (!adapter.skillDirectory) {
    return { prompt: originalPrompt, cleanup: () => {}, mode: "native", path: path.join(skillPath, "SKILL.md"), excluded: [] };
  }
  const destination = path.join(workspace, adapter.skillDirectory, skillName(skillPath));
  if (fs.existsSync(destination)) throw new Error(`Skill projection already exists: ${destination}`);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  copyRuntimePackage(destination);
  return {
    prompt: originalPrompt,
    cleanup: () => fs.rmSync(destination, { recursive: true, force: true }),
    mode: "native",
    path: destination,
    excluded: ["evals"],
  };
}

export async function runHarnessEval(options) {
  const adapter = getAdapter(options.adapter);
  const permission = options.permission ?? "read-only";
  if (!new Set(["read-only", "workspace-write"]).has(permission)) throw new Error("Invalid permission mode.");
  if (!adapter.safePermissions.has(permission)) {
    throw new Error(`${adapter.id} ${permission} is not safely isolated by this MVP adapter; use read-only or an externally isolated future adapter.`);
  }
  const subjectPath = fs.realpathSync(path.resolve(options.subjectPath));
  const workspace = fs.realpathSync(path.resolve(options.workspace));
  const traceDir = path.resolve(options.traceDir);
  const repositoryRoot = fs.realpathSync(execFileSync("git", ["-C", subjectPath, "rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim());
  const allowedRoot = path.join(repositoryRoot, ".skill-proposals", ".eval-runs");
  fs.mkdirSync(allowedRoot, { recursive: true });
  const allowedReal = fs.realpathSync(allowedRoot);
  if (!inside(allowedReal, workspace) || !inside(allowedReal, traceDir)) {
    throw new Error("Workspace and trace must be below .skill-proposals/.eval-runs.");
  }
  if (overlaps(subjectPath, workspace) || overlaps(subjectPath, traceDir)) {
    throw new Error("Subject and executor paths must be disjoint.");
  }
  if (fs.existsSync(traceDir) && fs.readdirSync(traceDir).length) throw new Error("Trace directory must be empty.");
  fs.mkdirSync(traceDir, { recursive: true });
  const traceReal = fs.realpathSync(traceDir);
  if (!inside(allowedReal, traceReal)) throw new Error("Trace real path escapes .skill-proposals/.eval-runs.");
  const relativeTrace = path.relative(workspace, traceReal);
  if (!relativeTrace.startsWith("..") && !path.isAbsolute(relativeTrace)) {
    throw new Error("Trace directory must be outside the executor workspace.");
  }
  const prompt = fs.readFileSync(path.resolve(options.promptFile), "utf8");
  const promptReal = fs.realpathSync(path.resolve(options.promptFile));
  if (!inside(workspace, promptReal)) throw new Error("Prompt file must be inside the executor workspace.");
  const caseIdentity = canonicalCase(subjectPath, options.caseId, workspace, prompt);
  const skillPath = options.skillPath ? fs.realpathSync(path.resolve(options.skillPath)) : null;
  if (skillPath && (overlaps(skillPath, workspace) || overlaps(skillPath, traceReal))) {
    throw new Error("Enabled skill and executor paths must be disjoint.");
  }
  const competing = installedNamesakes(adapter.id, workspace, skillName(subjectPath), skillPath);
  if (competing.length && !adapter.canDisableNamesakes) {
    throw new Error(`Installed namesake could contaminate the baseline: ${competing.join(", ")}`);
  }
  const subjectBefore = hashSkillPackage(subjectPath).content_sha256;
  const skillBefore = skillPath ? hashSkillPackage(skillPath).content_sha256 : null;
  const before = snapshot(workspace);
  const gitBefore = gitIdentity(workspace);
  const projection = prepareProjection(adapter, workspace, skillPath, prompt);
  const executable = resolveExecutable(options.executable ?? adapter.executable);
  const commandInput = {
    model: options.model,
    workspace,
    permission,
    prompt: projection.prompt,
    skillFile: skillPath ? path.join(skillPath, "SKILL.md") : null,
    disabledSkillPaths: competing,
    traceDir: traceReal,
  };
  const args = adapter.buildArgs(commandInput);
  const startedAt = new Date().toISOString();
  let processResult;
  try {
    processResult = await runProcess(executable, args, {
      cwd: workspace,
      input: adapter.promptOnStdin ? projection.prompt : "",
      timeoutMs: options.timeoutMs ?? 600_000,
      maxOutputBytes: options.maxOutputBytes ?? 10_000_000,
      env: adapter.buildEnv?.(commandInput) ?? {},
    });
  } finally {
    projection.cleanup();
  }
  const completedAt = new Date().toISOString();
  const after = snapshot(workspace);
  const gitAfter = gitIdentity(workspace);
  const subjectAfter = hashSkillPackage(subjectPath).content_sha256;
  const skillAfter = skillPath ? hashSkillPackage(skillPath).content_sha256 : null;
  const processCompleted = processResult.exitCode === 0 && !processResult.signal && !processResult.timedOut && !processResult.limitExceeded;
  const parsed = adapter.parser(processResult.stdout, { processCompleted });
  const reasons = [...parsed.errors];
  const protectedAccess = protectedSkillSourceAccess(processResult.stdout, workspace, subjectPath, skillPath, competing);
  if (protectedAccess) reasons.push("executor accessed protected skill source outside the workspace");
  if (processResult.exitCode !== 0) reasons.push(`executor exit code: ${processResult.exitCode}`);
  if (processResult.signal) reasons.push(`executor signal: ${processResult.signal}`);
  if (processResult.timedOut) reasons.push("executor timed out");
  if (processResult.limitExceeded) reasons.push("executor output limit exceeded");
  if (subjectBefore !== subjectAfter) reasons.push("subject package changed during the run");
  if (skillBefore !== skillAfter) reasons.push("enabled skill package changed during the run");
  const produced = artifact(before, after, workspace, parsed.final_message, { before: gitBefore, after: gitAfter });
  const rawFile = path.join(traceReal, "events.jsonl");
  const stderrFile = path.join(traceReal, "stderr.log");
  const finalFile = path.join(traceReal, "final-message.txt");
  const artifactFile = path.join(traceReal, "output-artifact.json");
  fs.writeFileSync(rawFile, processResult.stdout);
  fs.writeFileSync(stderrFile, processResult.stderr);
  fs.writeFileSync(finalFile, parsed.final_message);
  fs.writeFileSync(artifactFile, `${JSON.stringify(produced, null, 2)}\n`);
  let version = "unavailable";
  try {
    version = execFileSync(executable, ["--version"], { encoding: "utf8", timeout: 5000 }).trim();
  } catch {}
  const telemetry = {
    schema_version: 2,
    runner: "skill-eval/harness",
    result: reasons.length ? "inconclusive" : "completed",
    reasons,
    adapter: {
      id: adapter.id,
      projection: projection.mode,
      executable: adapter.executable,
      test_override: Boolean(options.executable),
      safety_enforced: true,
    },
    run: {
      id: options.runId,
      case_id: caseIdentity.id,
      configuration: options.configuration,
      model: options.model ?? "default",
      host: `${os.platform()}-${os.arch()}`,
      started_at: startedAt,
      completed_at: completedAt,
      duration_ms: processResult.durationMs,
      permission,
      timeout_ms: options.timeoutMs ?? 600_000,
      max_output_bytes: options.maxOutputBytes ?? 10_000_000,
      exit_code: processResult.exitCode,
    },
    subject: { path: subjectPath, before_sha256: subjectBefore, after_sha256: subjectAfter, unchanged: subjectBefore === subjectAfter },
    skill: {
      path: skillPath,
      before_sha256: skillBefore,
      after_sha256: skillAfter,
      unchanged: skillBefore === skillAfter,
      projection_path: projection.path,
      runtime_projection_excluded: projection.excluded,
      disabled_namesakes: competing,
    },
    prompt: { sha256: sha256(prompt) },
    isolation: { protected_source_access: Boolean(protectedAccess) },
    input_snapshot_sha256: sha256(JSON.stringify({ files: before, git: gitBefore })),
    fixture_sha256: caseIdentity.fixture_sha256,
    stream: { sha256: sha256(processResult.stdout), event_count: parsed.event_count },
    usage: parsed.usage,
    executor: { path: executable, version },
    artifacts: {
      events: "events.jsonl",
      stderr: "stderr.log",
      final_message: "final-message.txt",
      final_message_sha256: sha256(fs.readFileSync(finalFile)),
      output: "output-artifact.json",
      output_sha256: sha256(fs.readFileSync(artifactFile)),
    },
  };
  fs.writeFileSync(path.join(traceReal, "telemetry.json"), `${JSON.stringify(telemetry, null, 2)}\n`);
  return telemetry;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--list-adapters")) {
    process.stdout.write(`${JSON.stringify(listAdapters(), null, 2)}\n`);
    return;
  }
  const required = ["--adapter", "--subject-path", "--workspace", "--trace-dir", "--prompt-file", "--case-id", "--run-id", "--configuration"];
  if (required.some((flag) => !value(args, flag))) {
    console.error(`Usage: run-harness-eval.mjs ${required.join(" <value> ")} [--model <id>] [--permission read-only|workspace-write] [--skill-path <path>]`);
    process.exit(2);
  }
  const telemetry = await runHarnessEval({
    adapter: value(args, "--adapter"),
    subjectPath: value(args, "--subject-path"),
    workspace: value(args, "--workspace"),
    traceDir: value(args, "--trace-dir"),
    promptFile: value(args, "--prompt-file"),
    caseId: value(args, "--case-id"),
    runId: value(args, "--run-id"),
    configuration: value(args, "--configuration"),
    model: value(args, "--model"),
    permission: value(args, "--permission", "read-only"),
    skillPath: value(args, "--skill-path"),
    executable: value(args, "--test-executable"),
    timeoutMs: Number(value(args, "--timeout-ms", "600000")),
    maxOutputBytes: Number(value(args, "--max-output-bytes", "10000000")),
  });
  process.stdout.write(`${JSON.stringify(telemetry, null, 2)}\n`);
  if (telemetry.result !== "completed") process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
