#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";

const SHA256 = /^[0-9a-f]{64}$/;
const GIT_SHA = /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/;
const utf8 = new TextDecoder("utf-8", { fatal: true });
const runtimes = {
  "task-groundwork": ["gpt-5.6-terra", "high"],
  "evidence-scanner": ["gpt-5.6-luna", "high"],
  "to-spec": ["gpt-5.6-sol", "high"],
  commit: ["gpt-5.6-terra", "low"],
  "adversarial-review": ["gpt-5.6-sol", "high"],
  "readiness-review": ["gpt-5.6-sol", "high"],
};
const reportRules = {
  adversarial: {
    verdicts: ["PASS", "FAIL"],
    next: { PASS: ["review-stage gate"], FAIL: ["to-spec", "wait for answer"] },
  },
  readiness: {
    verdicts: ["READY", "NOT READY"],
    next: {
      READY: ["review-stage gate"],
      "NOT READY": ["to-spec", "wait for answer"],
    },
  },
};

const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const decode = (bytes) => utf8.decode(bytes);
const emit = (value) => process.stdout.write(JSON.stringify(value) + "\n");
const unique = (values) => [...new Set(values)];

function failUsage(message) {
  process.stderr.write(message + "\n");
  process.exitCode = 2;
}

function options(argv, names) {
  if (argv.length !== names.length * 2) throw new Error("wrong option count");
  const result = {};
  for (let index = 0; index < argv.length; index += 2) {
    const name = argv[index];
    const value = argv[index + 1];
    if (!names.includes(name) || !value || Object.hasOwn(result, name)) {
      throw new Error("invalid option: " + String(name));
    }
    result[name] = value;
  }
  return result;
}

function invalidReport(role, message) {
  return {
    role,
    valid: false,
    verdict: null,
    next: null,
    question: null,
    commit_sha: null,
    packet_sha256: null,
    errors: [message],
  };
}

function parseReport(role, text, commitSha, packetSha) {
  const rule = reportRules[role];
  const lines = text.split("\n").map((line) => line.endsWith("\r") ? line.slice(0, -1) : line);
  const nonblank = lines.filter((line) => line.trim());
  const errors = [];
  const verdict = lines[0] || null;
  if (!rule.verdicts.includes(verdict) || nonblank[0] !== verdict) {
    errors.push("INVALID_VERDICT");
  }

  const basis = (nonblank[1] || "").match(
    /^Basis: full; commit-sha=([0-9a-f]{40}|[0-9a-f]{64}); packet-sha256=([0-9a-f]{64}); \S.*$/,
  );
  if (!basis) errors.push("INVALID_BASIS");
  if (basis?.[1] !== commitSha) errors.push("COMMIT_SHA_MISMATCH");
  if (basis?.[2] !== packetSha) errors.push("PACKET_SHA256_MISMATCH");

  const nextLines = lines.filter((line) => line.startsWith("Next:"));
  const next = nextLines.length === 1 ? nextLines[0].slice(5).trim() : null;
  if (nextLines.length !== 1) errors.push("NEXT_COUNT");
  else if (nonblank.at(-1) !== nextLines[0]) errors.push("NEXT_NOT_FINAL");
  if (rule.verdicts.includes(verdict) && !rule.next[verdict].includes(next)) {
    errors.push("VERDICT_NEXT_CONFLICT");
  }

  const questionLines = lines.filter((line) => line.startsWith("Question:"));
  const question = questionLines.length === 1 ? questionLines[0].slice(9).trim() : null;
  if (questionLines.length > 1 || (questionLines.length === 1 && !question)) {
    errors.push("INVALID_QUESTION");
  }
  if ((next === "wait for answer") !== Boolean(question)) {
    errors.push("QUESTION_NEXT_CONFLICT");
  }

  for (const line of lines.filter((item) => item.startsWith("Evidence addition:"))) {
    const fields = line.slice(18).trim().split(" | ");
    if (fields.length !== 3 || !fields[0] || !GIT_SHA.test(fields[1]) || !fields[2]) {
      errors.push("INVALID_EVIDENCE_ADDITION");
    }
  }
  const critical = lines.some((line) => /^\[P[01]\] \S/.test(line));
  const blockers = lines.some((line) => /^\[Blocker\] \S/.test(line));
  if (role === "adversarial" && ((verdict === "PASS" && critical) || (verdict === "FAIL" && !critical))) {
    errors.push("VERDICT_BODY_CONFLICT");
  }
  if (role === "readiness") {
    const readyEvidence = lines.filter((line) => /^Ready evidence: \S/.test(line)).length;
    if ((verdict === "READY" && (blockers || readyEvidence !== 1)) ||
        (verdict === "NOT READY" && !blockers)) {
      errors.push("VERDICT_BODY_CONFLICT");
    }
  }

  return {
    role,
    valid: errors.length === 0,
    verdict,
    next,
    question,
    commit_sha: basis?.[1] || null,
    packet_sha256: basis?.[2] || null,
    errors: unique(errors),
  };
}

function combine(adversarial, readiness, commitSha, packetSha) {
  const reviews = { adversarial, readiness };
  const invalid = Object.values(reviews).filter((review) => !review.valid).map((review) => review.role);
  const questions = Object.values(reviews).filter((review) => review.valid && review.question)
    .map((review) => review.role);
  let state = "STOP";
  if (invalid.length) state = "INVALID";
  else if (questions.length) state = "WAIT_FOR_OWNER";
  else if (adversarial.verdict === "FAIL" || readiness.verdict === "NOT READY") {
    state = "ROOT_COMPLETE_REWRITE";
  }
  return {
    schema_version: 1,
    state,
    commit_sha: commitSha,
    packet_sha256: packetSha,
    invalid_reviewers: invalid,
    question_reviewers: questions,
    reviews,
  };
}

async function reviewGate(argv) {
  let args;
  try {
    args = options(argv, [
      "--adversarial-report",
      "--readiness-report",
      "--commit-sha",
      "--packet-manifest",
    ]);
  } catch (error) {
    failUsage("review gate: " + error.message);
    return;
  }
  if (!GIT_SHA.test(args["--commit-sha"])) {
    failUsage("review gate: commit SHA must be full and lowercase");
    return;
  }

  let packetBytes;
  try {
    packetBytes = await readFile(args["--packet-manifest"]);
  } catch (error) {
    failUsage("review gate: cannot read packet manifest: " + error.message);
    return;
  }
  const commitSha = args["--commit-sha"];
  const packetSha = digest(packetBytes);
  const readReview = async (role, path) => {
    try {
      return parseReport(role, decode(await readFile(path)), commitSha, packetSha);
    } catch (error) {
      return invalidReport(role, "UNREADABLE_REPORT: " + error.message);
    }
  };
  const [adversarial, readiness] = await Promise.all([
    readReview("adversarial", args["--adversarial-report"]),
    readReview("readiness", args["--readiness-report"]),
  ]);
  emit(combine(adversarial, readiness, commitSha, packetSha));
}

function checkResolutionJson(value) {
  const errors = [];
  const strings = [
    "owner_role", "source_dispatch_id", "source_stage", "source_mutation",
    "calling_phase", "question", "evidence",
  ];
  if (value?.schema !== "codex-task-to-spec/question-resolution-v1") errors.push("INVALID_SCHEMA");
  if (strings.some((key) => typeof value?.[key] !== "string" || !value[key])) {
    errors.push("MISSING_AUTHORITY_FIELD");
  }
  if (!SHA256.test(value?.basis_packet_sha256 || "")) errors.push("INVALID_PACKET_HASH");
  if (!["task-groundwork", "to-spec", "commit", "review-stage"].includes(value?.calling_phase)) {
    errors.push("INVALID_CALLING_PHASE");
  }
  if (/[\r\n]/.test(value?.question || "")) errors.push("QUESTION_NOT_SINGLE_LINE");
  if (!Array.isArray(value?.owner_answers) || !value.owner_answers.length ||
      value.owner_answers.some((answer) => typeof answer !== "string" || !answer)) {
    errors.push("INVALID_OWNER_ANSWERS");
  }
  if (typeof value?.evidence === "string" &&
      !value.evidence.split(/\r?\n/).includes("Question: " + value.question)) {
    errors.push("QUESTION_NOT_IN_EVIDENCE");
  }
  return errors;
}

function parseResolution(text, path, sha) {
  const match = text.match(
    /^Resolved: (yes|no)\nLock: (changed|unchanged)\nResume: (task-groundwork|to-spec|commit|review-stage)\nBasis: (\/[^\n]+) \| sha256:([0-9a-f]{64})\n?$/,
  );
  if (!match) return { errors: ["INVALID_FOUR_LINE_RESULT"] };
  const result = { resolved: match[1], lock: match[2], resume: match[3] };
  const errors = [];
  if (match[4] !== path) errors.push("BASIS_PATH_MISMATCH");
  if (match[5] !== sha) errors.push("BASIS_HASH_MISMATCH");
  if (result.lock === "changed" && result.resume !== "task-groundwork") {
    errors.push("CHANGED_LOCK_MUST_RESUME_GROUNDWORK");
  }
  return { ...result, errors };
}

async function validateResolution(argv) {
  let args;
  try {
    args = options(argv, ["--result", "--resolution"]);
  } catch (error) {
    failUsage("validate-resolution: " + error.message);
    return;
  }
  try {
    const [resultText, resolutionBytes] = await Promise.all([
      readFile(args["--result"]).then(decode),
      readFile(args["--resolution"]),
    ]);
    let document;
    try {
      document = JSON.parse(decode(resolutionBytes));
    } catch {
      emit({ state: "INVALID_RESOLUTION", errors: ["INVALID_RESOLUTION_JSON"] });
      return;
    }
    const result = parseResolution(
      resultText,
      resolve(args["--resolution"]),
      digest(resolutionBytes),
    );
    const errors = unique([...checkResolutionJson(document), ...result.errors]);
    if (errors.length) emit({ state: "INVALID_RESOLUTION", errors });
    else emit({ state: "VALID_RESOLUTION", ...result, errors: undefined });
  } catch (error) {
    failUsage("validate-resolution: cannot read input: " + error.message);
  }
}

const isBinding = (value) => value && typeof value === "object" &&
  isAbsolute(value.path || "") && SHA256.test(value.sha256 || "") &&
  (value.packet_sha256 === null || SHA256.test(value.packet_sha256 || ""));

async function checkBinding(binding, label, packetSha, errors) {
  if (!isBinding(binding)) {
    errors.push(label + ": INVALID_BINDING");
    return;
  }
  if (binding.packet_sha256 && packetSha && binding.packet_sha256 !== packetSha) {
    errors.push(label + ": PACKET_MISMATCH");
  }
  try {
    if (digest(await readFile(binding.path)) !== binding.sha256) errors.push(label + ": HASH_MISMATCH");
  } catch {
    errors.push(label + ": UNREADABLE");
  }
}

async function checkPacket(binding, errors) {
  await checkBinding(binding, "packet", null, errors);
  if (!isBinding(binding)) return null;
  let text;
  try {
    text = decode(await readFile(binding.path));
  } catch {
    return binding.sha256;
  }
  const lines = text.endsWith("\n") ? text.slice(0, -1).split("\n") : [];
  if (!lines.length || lines.join("\n") !== [...lines].sort().join("\n")) {
    errors.push("packet: INVALID_MANIFEST");
    return binding.sha256;
  }
  const root = dirname(binding.path);
  const seen = new Set();
  for (const line of lines) {
    const match = line.match(/^([0-9a-f]{64})  (artifacts\/[^\r\n]+)$/);
    const target = match ? resolve(root, match[2]) : root;
    if (!match || seen.has(match[2]) || match[2].split("/").includes("..") ||
        relative(root, target).startsWith("..")) {
      errors.push("packet: INVALID_ENTRY");
      continue;
    }
    seen.add(match[2]);
    try {
      if (digest(await readFile(target)) !== match[1]) errors.push("packet: ARTIFACT_HASH_MISMATCH");
    } catch {
      errors.push("packet: ARTIFACT_UNREADABLE");
    }
  }
  return binding.sha256;
}

async function checkCheckpoint(checkpoint, sequence) {
  const errors = [];
  if (checkpoint?.schema !== "codex-task-to-spec/checkpoint-v1") errors.push("INVALID_SCHEMA");
  if (!Number.isSafeInteger(checkpoint?.sequence) || checkpoint.sequence !== sequence) {
    errors.push("INVALID_SEQUENCE");
  }
  if (!isAbsolute(checkpoint?.repository?.root || "") ||
      !GIT_SHA.test(checkpoint?.repository?.expected_head || "") ||
      !SHA256.test(checkpoint?.repository?.staged_diff_sha256 || "")) {
    errors.push("INVALID_REPOSITORY_BASIS");
  }
  if (typeof checkpoint?.spec_id !== "string" || !checkpoint.spec_id ||
      typeof checkpoint?.next_action !== "string" ||
      !/^[A-Z][A-Z0-9_]*$/.test(checkpoint.next_action)) {
    errors.push("INVALID_CONTROL_STATE");
  }

  const packetSha = await checkPacket(checkpoint?.packet, errors);
  await checkBinding(checkpoint?.task, "task", packetSha, errors);

  if (!Array.isArray(checkpoint?.artifacts)) errors.push("INVALID_ARTIFACTS");
  else {
    const names = checkpoint.artifacts.map((item) => item?.name);
    if (names.some((name) => typeof name !== "string" || !name) ||
        new Set(names).size !== names.length ||
        names.join("\n") !== [...names].sort().join("\n")) {
      errors.push("INVALID_ARTIFACT_NAMES");
    }
    for (const item of checkpoint.artifacts) {
      await checkBinding(item?.binding, "artifact:" + String(item?.name), packetSha, errors);
    }
  }

  if (!Array.isArray(checkpoint?.active_dispatches)) errors.push("INVALID_DISPATCHES");
  else for (const dispatch of checkpoint.active_dispatches) {
    const runtime = runtimes[dispatch?.role];
    if (!runtime || dispatch.model !== runtime[0] || dispatch.effort !== runtime[1] ||
        dispatch.fork_turns !== "none" || dispatch.packet_sha256 !== packetSha) {
      errors.push("dispatch: RUNTIME_MISMATCH");
    }
    if (!["planned", "running", "returned"].includes(dispatch?.status) ||
        typeof dispatch?.dispatch_id !== "string" || !dispatch.dispatch_id) {
      errors.push("dispatch: INVALID_STATE");
    }
    if (dispatch?.status === "planned" ? dispatch.host_agent_id !== null :
        typeof dispatch?.host_agent_id !== "string" || !dispatch.host_agent_id) {
      errors.push("dispatch: INVALID_AGENT_ID");
    }
    await checkBinding(dispatch?.envelope, "dispatch:envelope", packetSha, errors);
    if (dispatch?.status === "returned") {
      await checkBinding(dispatch?.returned_output, "dispatch:return", packetSha, errors);
    } else if (dispatch?.returned_output !== null) errors.push("dispatch: UNEXPECTED_RETURN");
  }

  for (const key of ["receipt", "adversarial", "readiness"]) {
    if (![0, 1].includes(checkpoint?.retries?.[key])) errors.push("INVALID_RETRY");
  }
  if (checkpoint?.question !== null && typeof checkpoint?.question !== "object") {
    errors.push("INVALID_QUESTION");
  }
  if (checkpoint?.gate !== null &&
      !["INVALID", "WAIT_FOR_OWNER", "ROOT_COMPLETE_REWRITE", "STOP"].includes(checkpoint.gate)) {
    errors.push("INVALID_GATE");
  }
  return unique(errors);
}

async function inspectCurrent(path) {
  const current = decode(await readFile(path));
  const match = current.match(/^checkpoint-v([0-9]{4,})\.json  ([0-9a-f]{64})\n$/);
  if (!match) return { state: "INVALID_CHECKPOINT", errors: ["INVALID_CURRENT"] };
  let bytes;
  try {
    bytes = await readFile(join(dirname(path), "checkpoint-v" + match[1] + ".json"));
  } catch {
    return { state: "INVALID_CHECKPOINT", errors: ["CHECKPOINT_UNREADABLE"] };
  }
  if (digest(bytes) !== match[2]) {
    return { state: "INVALID_CHECKPOINT", errors: ["CHECKPOINT_HASH_MISMATCH"] };
  }
  let checkpoint;
  try {
    checkpoint = JSON.parse(decode(bytes));
  } catch {
    return { state: "INVALID_CHECKPOINT", errors: ["INVALID_CHECKPOINT_JSON"] };
  }
  const errors = await checkCheckpoint(checkpoint, Number(match[1]));
  return errors.length ? { state: "INVALID_CHECKPOINT", errors } : {
    state: "VALID_CHECKPOINT",
    spec_id: checkpoint.spec_id,
    sequence: checkpoint.sequence,
    next_action: checkpoint.next_action,
  };
}

async function validateCheckpoint(argv) {
  let args;
  try {
    args = options(argv, ["--current"]);
  } catch (error) {
    failUsage("validate-checkpoint: " + error.message);
    return;
  }
  try {
    emit(await inspectCurrent(resolve(args["--current"])));
  } catch (error) {
    failUsage("validate-checkpoint: cannot read CURRENT: " + error.message);
  }
}

function sample(role, verdict, next, commit, packet, question = null) {
  const lines = [
    verdict,
    "Basis: full; commit-sha=" + commit + "; packet-sha256=" + packet + "; fixture",
  ];
  if (role === "adversarial" && verdict === "FAIL") lines.push("[P1] fixture");
  if (role === "readiness" && verdict === "READY") lines.push("Ready evidence: fixture");
  if (role === "readiness" && verdict === "NOT READY") lines.push("[Blocker] fixture");
  if (question) lines.push("Question: " + question);
  lines.push("Next: " + next);
  return lines.join("\n") + "\n";
}

async function selfTest() {
  let count = 0;
  const assert = (condition, name) => {
    count += 1;
    if (!condition) throw new Error("self-test failed: " + name);
  };
  const commit = "1".repeat(40);
  const packet = "2".repeat(64);
  for (const [a, r, state] of [
    ["PASS", "READY", "STOP"],
    ["FAIL", "READY", "ROOT_COMPLETE_REWRITE"],
    ["PASS", "NOT READY", "ROOT_COMPLETE_REWRITE"],
    ["FAIL", "NOT READY", "ROOT_COMPLETE_REWRITE"],
  ]) {
    const adversarial = parseReport("adversarial",
      sample("adversarial", a, a === "PASS" ? "review-stage gate" : "to-spec", commit, packet),
      commit, packet);
    const readiness = parseReport("readiness",
      sample("readiness", r, r === "READY" ? "review-stage gate" : "to-spec", commit, packet),
      commit, packet);
    assert(combine(adversarial, readiness, commit, packet).state === state, "verdict matrix");
  }
  const question = parseReport("adversarial",
    sample("adversarial", "FAIL", "wait for answer", commit, packet, "Owner?"), commit, packet);
  const ready = parseReport("readiness",
    sample("readiness", "READY", "review-stage gate", commit, packet), commit, packet);
  assert(combine(question, ready, commit, packet).state === "WAIT_FOR_OWNER", "question priority");
  assert(!parseReport("readiness",
    sample("readiness", "READY", "to-spec", commit, packet), commit, packet).valid, "Next conflict");
  assert(!parseReport("adversarial",
    sample("adversarial", "PASS", "review-stage gate", commit, "3".repeat(64)),
    commit, packet).valid, "hash mismatch");
  assert(!GIT_SHA.test("A".repeat(40)), "uppercase hash");

  const root = await mkdtemp(join(tmpdir(), "review-gate-"));
  try {
    const packetRoot = join(root, "packet-v0001");
    await mkdir(join(packetRoot, "artifacts"), { recursive: true });
    const taskPath = join(packetRoot, "artifacts", "task.md");
    const task = Buffer.from("task\n");
    await writeFile(taskPath, task);
    const manifestPath = join(packetRoot, "manifest.sha256");
    const manifest = Buffer.from(digest(task) + "  artifacts/task.md\n");
    await writeFile(manifestPath, manifest);
    const packetSha = digest(manifest);
    const checkpoint = {
      schema: "codex-task-to-spec/checkpoint-v1",
      sequence: 1,
      spec_id: "fixture",
      repository: {
        root,
        branch: "codex/fixture",
        expected_head: commit,
        staged_diff_sha256: digest(Buffer.from("")),
      },
      task: { path: taskPath, sha256: digest(task), packet_sha256: packetSha },
      packet: { path: manifestPath, sha256: packetSha, packet_sha256: null },
      next_action: "SPAWN_GROUNDWORK",
      artifacts: [],
      active_dispatches: [],
      retries: { receipt: 0, adversarial: 0, readiness: 0 },
      question: null,
      gate: null,
    };
    const stateRoot = join(root, "state");
    await mkdir(stateRoot);
    const checkpointBytes = Buffer.from(JSON.stringify(checkpoint, null, 2) + "\n");
    await writeFile(join(stateRoot, "checkpoint-v0001.json"), checkpointBytes);
    const currentPath = join(stateRoot, "CURRENT");
    await writeFile(currentPath, "checkpoint-v0001.json  " + digest(checkpointBytes) + "\n");
    assert((await inspectCurrent(currentPath)).state === "VALID_CHECKPOINT", "checkpoint");
    await writeFile(currentPath, "checkpoint-v0001.json  " + "0".repeat(64) + "\n");
    assert((await inspectCurrent(currentPath)).state === "INVALID_CHECKPOINT", "checkpoint hash");

    const resolutionPath = join(root, "resolution.json");
    const resolution = {
      schema: "codex-task-to-spec/question-resolution-v1",
      owner_role: "to-spec",
      source_dispatch_id: "dispatch-1",
      source_stage: "to-spec",
      source_mutation: "spec",
      calling_phase: "to-spec",
      basis_packet_sha256: packetSha,
      question: "Owner?",
      evidence: "Question: Owner?\n",
      owner_answers: ["Use the existing owner."],
    };
    const bytes = Buffer.from(JSON.stringify(resolution) + "\n");
    await writeFile(resolutionPath, bytes);
    const parsed = parseResolution(
      "Resolved: yes\nLock: unchanged\nResume: to-spec\nBasis: " + resolutionPath +
      " | sha256:" + digest(bytes) + "\n",
      resolutionPath,
      digest(bytes),
    );
    assert(!checkResolutionJson(resolution).length && !parsed.errors.length, "resolution");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
  process.stdout.write("review-gate self-test: PASS (" + count + " cases)\n");
}

const argv = process.argv.slice(2);
if (argv[0] === "self-test") {
  if (argv.length === 1) await selfTest();
  else failUsage("self-test takes no options");
} else if (argv[0] === "validate-checkpoint") {
  await validateCheckpoint(argv.slice(1));
} else if (argv[0] === "validate-resolution") {
  await validateResolution(argv.slice(1));
} else {
  await reviewGate(argv);
}
