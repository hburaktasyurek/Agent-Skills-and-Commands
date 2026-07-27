#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import {
  configureWorkflowRecordsRoot,
  finishWorkflowStep,
  getWorkflowRecordsConfiguration,
  getWorkflowStepStatus,
  LIMITS,
  stableStringify,
  startWorkflowStep,
} from "./workflow-step-record-core.mjs";

const run = (command, args, cwd) => {
  const result = spawnSync(command, args, { cwd, encoding: "utf8" });
  assert.equal(
    result.status,
    0,
    `${command} ${args.join(" ")} failed: ${result.stderr}`,
  );
  return result.stdout.trim();
};

const expectFailure = (name, callback, pattern) => {
  let caught;
  try {
    callback();
  } catch (error) {
    caught = error;
  }
  assert.ok(caught instanceof Error, `${name}: expected an error`);
  assert.match(caught.message, pattern, `${name}: ${caught.message}`);
};

const commandRunner = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    encoding: options.encoding ?? null,
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.error || result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} failed: ${
        result.error?.message ?? result.stderr?.toString("utf8")
      }`,
    );
  }
  return Buffer.isBuffer(result.stdout)
    ? result.stdout
    : Buffer.from(String(result.stdout ?? ""));
};

const spawnResult = (command, args, options = {}) =>
  new Promise((resolve) => {
    const child = spawn(command, args, options);
    const stdout = [];
    const stderr = [];
    child.stdout.on("data", (chunk) => stdout.push(chunk));
    child.stderr.on("data", (chunk) => stderr.push(chunk));
    child.on("close", (status) =>
      resolve({
        status,
        stdout: Buffer.concat(stdout).toString("utf8"),
        stderr: Buffer.concat(stderr).toString("utf8"),
      }),
    );
  });

const initializeGitRepo = (directory, remoteName) => {
  fs.mkdirSync(directory, { recursive: true });
  run("git", ["init", "-q"], directory);
  run("git", ["config", "user.email", "workflow@example.invalid"], directory);
  run("git", ["config", "user.name", "Workflow Test"], directory);
  run(
    "git",
    ["remote", "add", "origin", `https://example.invalid/${remoteName}.git`],
    directory,
  );
};

const temporaryRoot = fs.mkdtempSync(
  path.join(os.tmpdir(), "workflow-step-record-test-"),
);
const productRoot = path.join(temporaryRoot, "product");
const recordsRoot = path.join(temporaryRoot, "records");

try {
  initializeGitRepo(productRoot, "product");
  initializeGitRepo(recordsRoot, "records");
  const defaultHome = path.join(temporaryRoot, "default-home");
  const defaultConfiguration = getWorkflowRecordsConfiguration({
    env: {},
    homeDirectory: defaultHome,
  });
  assert.equal(defaultConfiguration.source, "default");
  assert.equal(defaultConfiguration.sync_required, false);
  assert.equal(
    defaultConfiguration.records_root,
    fs.realpathSync(path.join(defaultHome, "workflow-records")),
  );
  assert.ok(fs.statSync(defaultConfiguration.records_root).isDirectory());

  const configuredRecordsRoot = path.join(
    temporaryRoot,
    "configured-records",
  );
  const configEnvironment = {
    XDG_CONFIG_HOME: path.join(temporaryRoot, "config-home"),
  };
  const configured = configureWorkflowRecordsRoot(configuredRecordsRoot, {
    env: configEnvironment,
    homeDirectory: defaultHome,
  });
  assert.equal(configured.source, "config");
  assert.equal(configured.sync_required, false);
  assert.equal(configured.records_root, fs.realpathSync(configuredRecordsRoot));
  assert.equal(
    getWorkflowRecordsConfiguration({
      env: configEnvironment,
      homeDirectory: defaultHome,
    }).records_root,
    fs.realpathSync(configuredRecordsRoot),
  );
  const environmentRecordsRoot = path.join(
    temporaryRoot,
    "environment-records",
  );
  const environmentConfiguration = getWorkflowRecordsConfiguration({
    env: {
      ...configEnvironment,
      WORKFLOW_RECORDS_ROOT: environmentRecordsRoot,
    },
    homeDirectory: defaultHome,
  });
  assert.equal(environmentConfiguration.source, "environment");
  assert.equal(
    environmentConfiguration.records_root,
    fs.realpathSync(environmentRecordsRoot),
  );
  assert.equal(
    fs.statSync(configured.config_path).mode & 0o777,
    0o600,
  );
  fs.writeFileSync(
    path.join(productRoot, "roadmap.md"),
    "# Roadmap\n\n## Task 3.2\nGround the workflow recorder.\n",
  );
  run("git", ["add", "roadmap.md"], productRoot);
  run("git", ["commit", "-qm", "docs: add roadmap"], productRoot);

  const environment = { WORKFLOW_RECORDS_ROOT: recordsRoot };
  assert.equal(
    stableStringify({ z: "e\u0301\r\n", a: { y: 2, x: 1 } }),
    stableStringify({ a: { x: 1, y: 2 }, z: "é\n" }),
  );
  const started = startWorkflowStep(
    {
      schema_version: 1,
      project: { id: "workflow-project", repo_root: productRoot },
      task: { roadmap_path: "roadmap.md", task_number: "3.2" },
      step: {
        skill: "task-groundwork",
        session_type: "design",
        attempt: 1,
      },
      session: { surface: "codex", model: "unknown" },
      input_sources: [
        {
          kind: "roadmap-task",
          source_type: "file",
          locator: "roadmap.md",
        },
      ],
    },
    { env: environment, now: () => "2026-07-27T12:00:00.000Z" },
  );
  assert.equal(started.status, "pending");
  assert.equal(started.sync_required, true);
  assert.equal(getWorkflowStepStatus(started.run_id, { env: environment }).status, "pending");
  const repeatedStart = startWorkflowStep(
    {
      schema_version: 1,
      project: { id: "workflow-project", repo_root: productRoot },
      task: { roadmap_path: "roadmap.md", task_number: "3.2" },
      step: {
        skill: "task-groundwork",
        session_type: "design",
        attempt: 1,
      },
      session: { surface: "codex", model: "unknown" },
      input_sources: [
        {
          kind: "roadmap-task",
          source_type: "file",
          locator: "roadmap.md",
        },
      ],
    },
    { env: environment, now: () => "2026-07-27T12:01:00.000Z" },
  );
  assert.equal(repeatedStart.run_id, started.run_id);
  assert.equal(
    JSON.parse(fs.readFileSync(started.start_path, "utf8")).recorded_at,
    "2026-07-27T12:00:00.000Z",
  );

  const finished = finishWorkflowStep(
    started.run_id,
    {
      output_sources: [
        {
          kind: "groundwork-output",
          source_type: "inline",
          locator: "## Status\nready for to-spec",
        },
      ],
      receipt: {
        kind: "completion",
        status: "completed",
        evidence: ["Groundwork returned the canonical ready status."],
      },
      observations: [],
      next: {
        session_type: "design",
        skill: "to-spec",
        input_reference: "groundwork-output",
      },
    },
    { env: environment, now: () => "2026-07-27T12:05:00.000Z" },
  );
  assert.equal(finished.status, "complete");
  const repeatedFinish = finishWorkflowStep(
    started.run_id,
    {
      output_sources: [
        {
          kind: "groundwork-output",
          source_type: "inline",
          locator: "## Status\nready for to-spec",
        },
      ],
      receipt: {
        kind: "completion",
        status: "completed",
        evidence: ["Groundwork returned the canonical ready status."],
      },
      observations: [],
      next: {
        session_type: "design",
        skill: "to-spec",
        input_reference: "groundwork-output",
      },
    },
    { env: environment, now: () => "2026-07-27T12:06:00.000Z" },
  );
  assert.equal(repeatedFinish.record_id, finished.record_id);
  assert.equal(
    JSON.parse(fs.readFileSync(finished.record_path, "utf8")).recorded_at,
    "2026-07-27T12:05:00.000Z",
  );
  assert.equal(getWorkflowStepStatus(started.run_id, { env: environment }).status, "complete");

  const specRoot = path.join(productRoot, "agent-os", "specs", "task-3-2");
  fs.mkdirSync(specRoot, { recursive: true });
  for (const name of ["shape.md", "plan.md", "references.md", "standards.md"]) {
    fs.writeFileSync(path.join(specRoot, name), `# ${name}\nInitial specification.\n`);
  }
  const specLocator = "agent-os/specs/task-3-2";
  const completionReceipt = (evidence) => ({
    kind: "completion",
    status: "completed",
    evidence: [evidence],
  });
  const next = (sessionType, skill, inputReference) => ({
    session_type: sessionType,
    skill,
    input_reference: inputReference,
  });
  const baseStart = (skill, sessionType, inputSources, attempt = 1) => ({
    schema_version: 1,
    project: { id: "workflow-project", repo_root: productRoot },
    task: { roadmap_path: "roadmap.md", task_number: "3.2" },
    step: { skill, session_type: sessionType, attempt },
    session: { surface: "codex", model: "test-model" },
    input_sources: inputSources,
  });
  const finish = (
    runId,
    outputSources,
    receipt,
    nextValue,
    options = {},
  ) =>
    finishWorkflowStep(
      runId,
      {
        output_sources: outputSources,
        receipt,
        observations: [],
        next: nextValue,
      },
      { env: environment, ...options },
    );

  const groundworkSource = {
    kind: "groundwork-output",
    source_type: "inline",
    locator: "## Status\nready for to-spec",
  };
  const specSource = {
    kind: "spec-cluster",
    source_type: "directory",
    locator: specLocator,
  };
  const reviewSource = {
    kind: "review-output",
    source_type: "inline",
    locator: "No P0/P1 findings. Proceed to spec-readiness.",
  };
  const taskContextSource = {
    kind: "task-context",
    source_type: "inline",
    locator: "Task 3.2: workflow recorder.",
  };

  const toSpec = startWorkflowStep(
    baseStart("to-spec", "design", [groundworkSource]),
    { env: environment },
  );
  assert.equal(
    finish(
      toSpec.run_id,
      [specSource],
      completionReceipt("Four-file spec cluster written."),
      next("review", "adversarial-spec-review", specLocator),
    ).result,
    "completed",
  );

  const blockedCommit = startWorkflowStep(
    baseStart("commit-work", "commit-pr", [
      { kind: "git-state", source_type: "git-state", locator: "." },
    ], 2),
    { env: environment },
  );
  assert.equal(
    finish(
      blockedCommit.run_id,
      [
        {
          kind: "blocked-output",
          source_type: "inline",
          locator: "Commit stopped because a secret requires human action.",
        },
      ],
      {
        kind: "completion",
        status: "blocked",
        evidence: ["Secret signature reported before staging."],
        blocked_reason: "Human must remove or rotate the secret.",
      },
      next("commit-pr", "human-action", "secret finding"),
    ).result,
    "blocked",
  );

  const specReview = startWorkflowStep(
    baseStart("adversarial-spec-review", "review", [specSource]),
    { env: environment },
  );
  assert.equal(
    finish(
      specReview.run_id,
      [reviewSource],
      {
        kind: "adversarial-review",
        verdict_line: "No P0/P1 findings.",
        coverage: "complete",
        current_findings: [{ id: "F1", severity: "P2" }],
      },
      next("review", "spec-readiness", specLocator),
    ).result,
    "pass",
  );

  const revise = startWorkflowStep(
    baseStart("revise-spec-from-review", "design", [
      specSource,
      reviewSource,
      taskContextSource,
    ]),
    { env: environment },
  );
  fs.appendFileSync(path.join(specRoot, "plan.md"), "\nRevision applied.\n");
  assert.equal(
    finish(
      revise.run_id,
      [specSource],
      completionReceipt("Supplied findings locally reconciled."),
      next("review", "adversarial-spec-review", specLocator),
    ).result,
    "completed",
  );

  const readiness = startWorkflowStep(
    baseStart("spec-readiness", "review", [specSource]),
    { env: environment },
  );
  assert.equal(
    finish(
      readiness.run_id,
      [
        {
          kind: "readiness-output",
          source_type: "inline",
          locator: "READY\nNo implementation blockers.",
        },
      ],
      { kind: "readiness", verdict_line: "READY", blocker_count: 0 },
      next("implementation", "senior-implementer", specLocator),
    ).result,
    "pass",
  );

  const implement = startWorkflowStep(
    baseStart("senior-implementer", "implementation", [specSource]),
    { env: environment },
  );
  assert.equal(
    finish(
      implement.run_id,
      [{ kind: "git-state", source_type: "git-state", locator: "." }],
      completionReceipt("Implementation and feedback loop completed."),
      next("commit-pr", "commit-work", "current-git-state"),
    ).result,
    "completed",
  );

  const commitStep = startWorkflowStep(
    baseStart("commit-work", "commit-pr", [
      { kind: "git-state", source_type: "git-state", locator: "." },
    ]),
    { env: environment },
  );
  const head = run("git", ["rev-parse", "HEAD"], productRoot);
  assert.equal(
    finish(
      commitStep.run_id,
      [{ kind: "commits", source_type: "commits", locator: [head] }],
      completionReceipt("Commit exists at the exact SHA."),
      next("commit-pr", "pr-branch", head),
    ).result,
    "completed",
  );

  const fakePr = {
    number: 42,
    url: "https://example.invalid/product/pull/42",
    baseRefName: "main",
    baseRefOid: "b".repeat(40),
    headRefName: "feature/workflow",
    headRefOid: head,
  };
  const stablePrRunner = (command, args, options = {}) => {
    if (command === "gh" && args[0] === "pr" && args[1] === "view") {
      return Buffer.from(JSON.stringify(fakePr));
    }
    if (command === "gh" && args[0] === "pr" && args[1] === "diff") {
      return Buffer.from("diff --git a/a b/a\n");
    }
    return commandRunner(command, args, options);
  };

  const prStep = startWorkflowStep(
    baseStart("pr-branch", "commit-pr", [
      { kind: "commits", source_type: "commits", locator: [head] },
    ]),
    { env: environment },
  );
  const prFinish = finish(
      prStep.run_id,
      [{ kind: "pr", source_type: "pr", locator: 42 }],
      completionReceipt("PR 42 opened against the confirmed base."),
      next("review", "adversarial-diff-review", "PR 42"),
      { commandRunner: stablePrRunner },
  );
  assert.equal(prFinish.result, "completed");
  const prRecord = JSON.parse(fs.readFileSync(prFinish.record_path, "utf8"));
  const prDigest = prRecord.output_artifacts[0].digest.slice(7);
  const prMetadata = JSON.parse(
    fs.readFileSync(
      path.join(
        recordsRoot,
        "artifacts",
        "sha256",
        prDigest,
        "metadata.json",
      ),
      "utf8",
    ),
  );
  assert.equal(prMetadata.baseRefName, "main");
  assert.equal(prMetadata.headRefName, "feature/workflow");

  const diffReview = startWorkflowStep(
    baseStart("adversarial-diff-review", "review", [
      { kind: "pr", source_type: "pr", locator: 42 },
      taskContextSource,
    ]),
    { env: environment, commandRunner: stablePrRunner },
  );
  assert.equal(
    finish(
      diffReview.run_id,
      [
        {
          kind: "diff-review-output",
          source_type: "inline",
          locator: "Implementation survived. Coverage complete.",
        },
      ],
      {
        kind: "adversarial-review",
        verdict_line: "Implementation survived.",
        coverage: "complete",
        current_findings: [],
      },
      next("review", "human-action", "merge decision"),
      { commandRunner: stablePrRunner },
    ).result,
    "pass",
  );

  const failedReview = startWorkflowStep(
    baseStart("adversarial-spec-review", "review", [specSource], 2),
    { env: environment },
  );
  assert.equal(
    finish(
      failedReview.run_id,
      [reviewSource],
      {
        kind: "adversarial-review",
        verdict_line: "Plan is not ready.",
        coverage: "complete",
        current_findings: [{ id: "F-P1", severity: "P1" }],
      },
      next("design", "revise-spec-from-review", "F-P1"),
    ).result,
    "fail",
  );

  const incompleteReview = startWorkflowStep(
    baseStart("adversarial-spec-review", "review", [specSource], 3),
    { env: environment },
  );
  assert.equal(
    finish(
      incompleteReview.run_id,
      [reviewSource],
      {
        kind: "adversarial-review",
        verdict_line: "Review incomplete.",
        coverage: "partial",
        current_findings: [],
      },
      next("review", "adversarial-spec-review", specLocator),
    ).result,
    "incomplete",
  );

  const blockedReview = startWorkflowStep(
    baseStart("adversarial-spec-review", "review", [specSource], 8),
    { env: environment },
  );
  assert.equal(
    finish(
      blockedReview.run_id,
      [
        {
          kind: "blocked-output",
          source_type: "inline",
          locator: "Review could not establish complete coverage.",
        },
      ],
      {
        kind: "adversarial-review",
        verdict_line: "Review blocked.",
        coverage: "partial",
        current_findings: [],
        blocked_reason: "Required task evidence is unavailable.",
      },
      next("review", "human-action", "missing task evidence"),
    ).result,
    "blocked",
  );

  const notReady = startWorkflowStep(
    baseStart("spec-readiness", "review", [specSource], 3),
    { env: environment },
  );
  assert.equal(
    finish(
      notReady.run_id,
      [
        {
          kind: "readiness-output",
          source_type: "inline",
          locator: "NOT READY\nTwo implementation blockers.",
        },
      ],
      { kind: "readiness", verdict_line: "NOT READY", blocker_count: 2 },
      next("design", "revise-spec-from-review", "readiness blockers"),
    ).result,
    "fail",
  );

  const prMutationReview = startWorkflowStep(
    baseStart("adversarial-diff-review", "review", [
      { kind: "pr", source_type: "pr", locator: 42 },
      taskContextSource,
    ], 3),
    { env: environment, commandRunner: stablePrRunner },
  );
  const changedButStablePrRunner = (command, args, options = {}) => {
    if (command === "gh" && args[0] === "pr" && args[1] === "view") {
      return Buffer.from(
        JSON.stringify({ ...fakePr, headRefOid: "d".repeat(40) }),
      );
    }
    if (command === "gh" && args[0] === "pr" && args[1] === "diff") {
      return Buffer.from("changed diff");
    }
    return commandRunner(command, args, options);
  };
  expectFailure(
    "PR changed between start and finish",
    () =>
      finish(
        prMutationReview.run_id,
        [
          {
            kind: "diff-review-output",
            source_type: "inline",
            locator: "Review output for stale PR.",
          },
        ],
        {
          kind: "adversarial-review",
          verdict_line: "Implementation survived.",
          coverage: "complete",
          current_findings: [],
        },
        next("review", "human-action", "merge decision"),
        { commandRunner: changedButStablePrRunner },
      ),
    /input-mutated-during-run/,
  );

  const contradictoryReadiness = startWorkflowStep(
    baseStart("spec-readiness", "review", [specSource], 2),
    { env: environment },
  );
  expectFailure(
    "contradictory readiness",
    () =>
      finish(
        contradictoryReadiness.run_id,
        [
          {
            kind: "readiness-output",
            source_type: "inline",
            locator: "READY",
          },
        ],
        { kind: "readiness", verdict_line: "READY", blocker_count: 1 },
        next("design", "revise-spec-from-review", "readiness"),
      ),
    /ambiguous-verdict/,
  );

  const mutationReview = startWorkflowStep(
    baseStart("adversarial-spec-review", "review", [specSource], 4),
    { env: environment },
  );
  fs.appendFileSync(path.join(specRoot, "shape.md"), "\nChanged during review.\n");
  expectFailure(
    "read-only mutation",
    () =>
      finish(
        mutationReview.run_id,
        [reviewSource],
        {
          kind: "adversarial-review",
          verdict_line: "No current findings.",
          coverage: "complete",
          current_findings: [],
        },
        next("review", "spec-readiness", specLocator),
      ),
    /input-mutated-during-run/,
  );

  expectFailure(
    "attempt collision",
    () =>
      startWorkflowStep(
        {
          ...baseStart("to-spec", "design", [
            {
              ...groundworkSource,
              locator: "Different grounded task output.",
            },
          ]),
        },
        { env: environment },
      ),
    /attempt-collision/,
  );

  expectFailure(
    "missing required artifact",
    () =>
      startWorkflowStep(
        baseStart("adversarial-diff-review", "review", [taskContextSource], 2),
        { env: environment },
      ),
    /missing-artifact/,
  );

  const missingModel = baseStart("to-spec", "design", [groundworkSource], 4);
  delete missingModel.session.model;
  expectFailure(
    "missing model metadata",
    () => startWorkflowStep(missingModel, { env: environment }),
    /session.model/,
  );

  const explicitRecordsRoot = path.join(temporaryRoot, "explicit-records");
  const explicitRootInput = baseStart(
    "to-spec",
    "design",
    [groundworkSource],
    1,
  );
  explicitRootInput.task.task_number = "8.1";
  explicitRootInput.records_root = explicitRecordsRoot;
  const explicitRootStart = startWorkflowStep(explicitRootInput, {
    env: {
      WORKFLOW_RECORDS_ROOT: path.join(temporaryRoot, "environment-records"),
    },
  });
  assert.equal(
    explicitRootStart.records_root,
    fs.realpathSync(explicitRecordsRoot),
  );
  assert.equal(explicitRootStart.records_root_source, "input");
  assert.equal(explicitRootStart.sync_required, false);
  assert.ok(fs.statSync(explicitRecordsRoot).isDirectory());

  expectFailure(
    "wrong session ownership",
    () =>
      startWorkflowStep(
        baseStart("senior-implementer", "design", [specSource], 2),
        { env: environment },
      ),
    /requires session_type implementation/,
  );

  expectFailure(
    "path traversal",
    () =>
      startWorkflowStep(
        baseStart("task-groundwork", "design", [
          {
            kind: "roadmap-task",
            source_type: "file",
            locator: "../outside.md",
          },
        ], 2),
        { env: environment },
      ),
    /path-traversal/,
  );

  const mismatchedRoadmap = baseStart("task-groundwork", "design", [
    {
      kind: "roadmap-task",
      source_type: "file",
      locator: "raw-roadmap.bin",
    },
  ], 4);
  expectFailure(
    "roadmap metadata mismatch",
    () => startWorkflowStep(mismatchedRoadmap, { env: environment }),
    /must match task\.roadmap_path/,
  );

  const secretFixtures = [
    "-----BEGIN PRIVATE KEY-----",
    `ghp_${"a".repeat(24)}`,
    `github_pat_${"b".repeat(24)}`,
    `AKIA${"C".repeat(16)}`,
    `ASIA${"D".repeat(16)}`,
    `xoxb-${"e".repeat(16)}`,
    `sk_live_${"f".repeat(20)}`,
    `sk-${"g".repeat(24)}`,
  ];
  for (const [index, secret] of secretFixtures.entries()) {
    expectFailure(
      `secret signature ${index + 1}`,
      () =>
        startWorkflowStep(
          baseStart(
            "to-spec",
            "design",
            [
              {
                kind: "groundwork-output",
                source_type: "inline",
                locator: `token ${secret}`,
              },
            ],
            2,
          ),
          { env: environment },
        ),
      /sensitive-content-blocked/,
    );
  }

  const secretModelStart = baseStart(
    "to-spec",
    "design",
    [groundworkSource],
    10,
  );
  secretModelStart.session.model = `ghp_${"m".repeat(24)}`;
  expectFailure(
    "secret in start metadata",
    () => startWorkflowStep(secretModelStart, { env: environment }),
    /sensitive-content-blocked/,
  );

  const secretFinishStart = startWorkflowStep(
    baseStart("to-spec", "design", [groundworkSource], 11),
    { env: environment },
  );
  const secretFinishRecordPath = path.join(
    path.dirname(secretFinishStart.start_path),
    "record.json",
  );
  expectFailure(
    "secret in finish metadata",
    () =>
      finish(
        secretFinishStart.run_id,
        [
          {
            kind: "spec-cluster",
            source_type: "directory",
            locator: specLocator,
          },
        ],
        {
          kind: "completion",
          status: "completed",
          evidence: [`ghp_${"r".repeat(24)}`],
        },
        next("review", "adversarial-spec-review", specLocator),
      ),
    /sensitive-content-blocked/,
  );
  assert.equal(fs.existsSync(secretFinishRecordPath), false);

  const unknownReceiptStart = startWorkflowStep(
    baseStart("to-spec", "design", [groundworkSource], 12),
    { env: environment },
  );
  expectFailure(
    "unknown receipt field",
    () =>
      finish(
        unknownReceiptStart.run_id,
        [specSource],
        {
          ...completionReceipt("Spec written."),
          uncontracted_extra: "must not survive",
        },
        next("review", "adversarial-spec-review", specLocator),
      ),
    /receipt\.uncontracted_extra is not allowed/,
  );
  expectFailure(
    "missing receipt field",
    () =>
      finish(
        unknownReceiptStart.run_id,
        [specSource],
        { kind: "completion", status: "completed" },
        next("review", "adversarial-spec-review", specLocator),
      ),
    /ambiguous-verdict/,
  );

  const credentialRecordsRoot = path.join(
    temporaryRoot,
    "credential-records",
  );
  initializeGitRepo(credentialRecordsRoot, "credential-records");
  run(
    "git",
    [
      "remote",
      "set-url",
      "origin",
      "https://user:password@example.invalid/records.git",
    ],
    credentialRecordsRoot,
  );
  expectFailure(
    "credential-bearing records remote",
    () =>
      startWorkflowStep(
        baseStart("to-spec", "design", [groundworkSource], 13),
        { env: { WORKFLOW_RECORDS_ROOT: credentialRecordsRoot } },
      ),
    /sensitive-content-blocked/,
  );

  const specLink = path.join(productRoot, "spec-link");
  fs.symlinkSync(specRoot, specLink);
  expectFailure(
    "symlink artifact",
    () =>
      startWorkflowStep(
        baseStart("adversarial-spec-review", "review", [
          {
            kind: "spec-cluster",
            source_type: "directory",
            locator: "spec-link",
          },
        ], 5),
        { env: environment },
      ),
    /symlink-rejected/,
  );
  fs.rmSync(specLink);

  const tamperStartInput = baseStart(
    "task-groundwork",
    "design",
    [
      {
        kind: "roadmap-task",
        source_type: "file",
        locator: "roadmap.md",
      },
    ],
    20,
  );
  const tamperStart = startWorkflowStep(tamperStartInput, {
    env: environment,
  });
  const originalStartText = fs.readFileSync(tamperStart.start_path, "utf8");
  const tamperedStartDocument = JSON.parse(originalStartText);
  tamperedStartDocument.runtime.repo_root = "/tampered/repository";
  fs.writeFileSync(
    tamperStart.start_path,
    `${JSON.stringify(tamperedStartDocument, null, 2)}\n`,
  );
  expectFailure(
    "tampered canonical start",
    () => startWorkflowStep(tamperStartInput, { env: environment }),
    /content-collision/,
  );
  fs.writeFileSync(tamperStart.start_path, originalStartText);
  const canonicalStartBackup = path.join(
    temporaryRoot,
    "canonical-start-backup.json",
  );
  fs.writeFileSync(canonicalStartBackup, originalStartText);
  fs.rmSync(tamperStart.start_path);
  fs.symlinkSync(canonicalStartBackup, tamperStart.start_path);
  expectFailure(
    "canonical start symlink",
    () => startWorkflowStep(tamperStartInput, { env: environment }),
    /symlink-rejected/,
  );
  fs.rmSync(tamperStart.start_path);
  fs.writeFileSync(tamperStart.start_path, originalStartText);

  const tamperFinishInput = {
    output_sources: [
      {
        kind: "groundwork-output",
        source_type: "inline",
        locator: "Unique tamper-test groundwork output.",
      },
    ],
    receipt: completionReceipt("Original tamper-test evidence."),
    observations: [],
    next: next("design", "to-spec", "tamper-test groundwork"),
  };
  const tamperFinish = finishWorkflowStep(
    tamperStart.run_id,
    tamperFinishInput,
    { env: environment },
  );
  const originalRecordText = fs.readFileSync(tamperFinish.record_path, "utf8");
  const tamperedRecordDocument = JSON.parse(originalRecordText);
  tamperedRecordDocument.receipt.evidence = ["Tampered evidence."];
  fs.writeFileSync(
    tamperFinish.record_path,
    `${JSON.stringify(tamperedRecordDocument, null, 2)}\n`,
  );
  expectFailure(
    "tampered canonical record",
    () =>
      finishWorkflowStep(tamperStart.run_id, tamperFinishInput, {
        env: environment,
      }),
    /content-collision/,
  );
  expectFailure(
    "idempotent start validates an existing completed record",
    () => startWorkflowStep(tamperStartInput, { env: environment }),
    /content-collision/,
  );
  fs.writeFileSync(tamperFinish.record_path, originalRecordText);
  const canonicalRecordBackup = path.join(
    temporaryRoot,
    "canonical-record-backup.json",
  );
  fs.writeFileSync(canonicalRecordBackup, originalRecordText);
  fs.rmSync(tamperFinish.record_path);
  fs.symlinkSync(canonicalRecordBackup, tamperFinish.record_path);
  expectFailure(
    "canonical record symlink",
    () =>
      finishWorkflowStep(tamperStart.run_id, tamperFinishInput, {
        env: environment,
      }),
    /symlink-rejected/,
  );
  fs.rmSync(tamperFinish.record_path);
  fs.writeFileSync(tamperFinish.record_path, originalRecordText);

  const tamperRecordDocument = JSON.parse(originalRecordText);
  const tamperArtifactRoot = path.join(
    recordsRoot,
    "artifacts",
    "sha256",
    tamperRecordDocument.output_artifacts[0].digest.slice("sha256:".length),
  );
  const tamperArtifactFile = path.join(tamperArtifactRoot, "content.txt");
  const originalArtifactBytes = fs.readFileSync(tamperArtifactFile);
  fs.writeFileSync(tamperArtifactFile, "Corrupted artifact bytes.");
  expectFailure(
    "tampered artifact payload",
    () =>
      finishWorkflowStep(tamperStart.run_id, tamperFinishInput, {
        env: environment,
      }),
    /content-collision/,
  );
  expectFailure(
    "status validates completed artifact payloads",
    () => getWorkflowStepStatus(tamperStart.run_id, { env: environment }),
    /content-collision/,
  );
  expectFailure(
    "idempotent start validates completed artifact payloads",
    () => startWorkflowStep(tamperStartInput, { env: environment }),
    /content-collision/,
  );
  fs.writeFileSync(tamperArtifactFile, originalArtifactBytes);

  const noClobberInput = baseStart(
    "to-spec",
    "design",
    [
      {
        kind: "groundwork-output",
        source_type: "inline",
        locator: "Unique no-clobber input.",
      },
    ],
    21,
  );
  const noClobberStart = startWorkflowStep(noClobberInput, {
    env: environment,
  });
  const noClobberDocument = JSON.parse(
    fs.readFileSync(noClobberStart.start_path, "utf8"),
  );
  const noClobberArtifact = path.join(
    recordsRoot,
    "artifacts",
    "sha256",
    noClobberDocument.input_artifacts[0].digest.slice("sha256:".length),
  );
  fs.rmSync(noClobberArtifact, { recursive: true });
  fs.mkdirSync(noClobberArtifact);
  expectFailure(
    "empty canonical artifact target is never overwritten",
    () => startWorkflowStep(noClobberInput, { env: environment }),
    /content-collision/,
  );
  assert.deepEqual(fs.readdirSync(noClobberArtifact), []);

  const unicodeSpecRoot = path.join(productRoot, "unicode-spec");
  fs.mkdirSync(unicodeSpecRoot);
  fs.writeFileSync(path.join(unicodeSpecRoot, "e\u0301.md"), "unicode path");
  const unicodeInput = baseStart(
    "adversarial-spec-review",
    "review",
    [
      {
        kind: "spec-cluster",
        source_type: "directory",
        locator: "unicode-spec",
      },
    ],
    23,
  );
  unicodeInput.task.task_number = "11.1";
  const unicodeStart = startWorkflowStep(unicodeInput, { env: environment });
  const unicodeDocument = JSON.parse(
    fs.readFileSync(unicodeStart.start_path, "utf8"),
  );
  const unicodeArtifactRoot = path.join(
    recordsRoot,
    "artifacts",
    "sha256",
    unicodeDocument.input_artifacts[0].digest.slice("sha256:".length),
  );
  assert.equal(
    fs.existsSync(path.join(unicodeArtifactRoot, "files", "é.md")),
    true,
  );

  let gitStatePass = 0;
  const changingGitStateRunner = (command, args, options = {}) => {
    if (command === "git" && args[0] === "branch" && args[1] === "--show-current") {
      gitStatePass += 1;
      if (gitStatePass === 2) {
        fs.writeFileSync(
          path.join(productRoot, "changed-during-capture.txt"),
          "changed",
        );
      }
    }
    return commandRunner(command, args, options);
  };
  expectFailure(
    "Git state changes during capture",
    () =>
      startWorkflowStep(
        baseStart(
          "commit-work",
          "commit-pr",
          [{ kind: "git-state", source_type: "git-state", locator: "." }],
          22,
        ),
        { env: environment, commandRunner: changingGitStateRunner },
      ),
    /input-mutated-during-capture/,
  );
  fs.rmSync(path.join(productRoot, "changed-during-capture.txt"));

  const rawRoadmap = Buffer.from([0, 13, 10, 255, 65]);
  fs.writeFileSync(path.join(productRoot, "raw-roadmap.bin"), rawRoadmap);
  const rawStartInput = baseStart("task-groundwork", "design", [
    {
      kind: "roadmap-task",
      source_type: "file",
      locator: "raw-roadmap.bin",
    },
  ], 2);
  rawStartInput.task.roadmap_path = "raw-roadmap.bin";
  const rawStart = startWorkflowStep(rawStartInput, { env: environment });
  const rawStartDocument = JSON.parse(
    fs.readFileSync(rawStart.start_path, "utf8"),
  );
  const rawDigest = rawStartDocument.input_artifacts[0].digest.slice(7);
  assert.deepEqual(
    fs.readFileSync(
      path.join(
        recordsRoot,
        "artifacts",
        "sha256",
        rawDigest,
        "files",
        "raw-roadmap.bin",
      ),
    ),
    rawRoadmap,
  );

  fs.writeFileSync(
    path.join(productRoot, "oversized-roadmap.bin"),
    Buffer.alloc(LIMITS.max_file_bytes + 1),
  );
  const oversizedInput = baseStart("task-groundwork", "design", [
    {
      kind: "roadmap-task",
      source_type: "file",
      locator: "oversized-roadmap.bin",
    },
  ], 3);
  oversizedInput.task.roadmap_path = "oversized-roadmap.bin";
  expectFailure(
    "single file size limit",
    () => startWorkflowStep(oversizedInput, { env: environment }),
    /snapshot-too-large/,
  );

  const manyFilesRoot = path.join(productRoot, "too-many-files");
  fs.mkdirSync(manyFilesRoot);
  for (let index = 0; index <= LIMITS.max_manifest_files; index += 1) {
    fs.writeFileSync(path.join(manyFilesRoot, `${index}.txt`), "x");
  }
  expectFailure(
    "manifest file count limit",
    () =>
      startWorkflowStep(
        baseStart("adversarial-spec-review", "review", [
          {
            kind: "spec-cluster",
            source_type: "directory",
            locator: "too-many-files",
          },
        ], 6),
        { env: environment },
      ),
    /snapshot-too-large/,
  );

  const largeRunRoot = path.join(productRoot, "too-large-run");
  fs.mkdirSync(largeRunRoot);
  for (let index = 0; index < 6; index += 1) {
    fs.writeFileSync(
      path.join(largeRunRoot, `${index}.bin`),
      Buffer.alloc(9 * 1024 * 1024),
    );
  }
  expectFailure(
    "total run size limit",
    () =>
      startWorkflowStep(
        baseStart("adversarial-spec-review", "review", [
          {
            kind: "spec-cluster",
            source_type: "directory",
            locator: "too-large-run",
          },
        ], 7),
        { env: environment },
      ),
    /snapshot-too-large/,
  );

  const combinedLimitRoot = path.join(productRoot, "combined-limit");
  fs.mkdirSync(combinedLimitRoot);
  for (let index = 0; index < 3; index += 1) {
    fs.writeFileSync(
      path.join(combinedLimitRoot, `${index}.bin`),
      Buffer.alloc(9 * 1024 * 1024),
    );
  }
  const combinedSpecSource = {
    kind: "spec-cluster",
    source_type: "directory",
    locator: "combined-limit",
  };
  const combinedLimitRun = startWorkflowStep(
    baseStart("revise-spec-from-review", "design", [
      combinedSpecSource,
      reviewSource,
      taskContextSource,
    ], 2),
    { env: environment },
  );
  expectFailure(
    "combined start and finish size limit",
    () =>
      finish(
        combinedLimitRun.run_id,
        [combinedSpecSource],
        completionReceipt("Large revision."),
        next("review", "adversarial-spec-review", "combined-limit"),
      ),
    /snapshot-too-large/,
  );

  let prViewCount = 0;
  const changingPrRunner = (command, args, options = {}) => {
    if (command === "gh" && args[0] === "pr" && args[1] === "view") {
      prViewCount += 1;
      return Buffer.from(
        JSON.stringify({
          ...fakePr,
          headRefOid: prViewCount === 1 ? head : "c".repeat(40),
        }),
      );
    }
    if (command === "gh") return Buffer.from("diff");
    return commandRunner(command, args, options);
  };
  expectFailure(
    "PR head changes during capture",
    () =>
      startWorkflowStep(
        baseStart("adversarial-diff-review", "review", [
          { kind: "pr", source_type: "pr", locator: 42 },
          taskContextSource,
        ], 2),
        { env: environment, commandRunner: changingPrRunner },
      ),
    /pr-head-changed/,
  );

  const runFilesBefore = fs
    .readdirSync(
      path.join(
        recordsRoot,
        "projects",
        "workflow-project",
        "tasks",
        "3.2",
        "runs",
      ),
    )
    .length;
  assert.ok(runFilesBefore >= 10);

  const cliScript = new URL("./workflow-step-record.mjs", import.meta.url)
    .pathname;
  const explicitCliStatus = spawnSync(
    process.execPath,
    [cliScript, "status", explicitRootStart.run_id, explicitRecordsRoot],
    { encoding: "utf8" },
  );
  assert.equal(explicitCliStatus.status, 0, explicitCliStatus.stderr);
  assert.equal(JSON.parse(explicitCliStatus.stdout).status, "pending");

  const cliConfigEnvironment = {
    ...process.env,
    XDG_CONFIG_HOME: path.join(temporaryRoot, "cli-config-home"),
  };
  delete cliConfigEnvironment.WORKFLOW_RECORDS_ROOT;
  const cliConfiguredRoot = path.join(temporaryRoot, "cli-records");
  const cliConfigure = spawnSync(
    process.execPath,
    [cliScript, "configure", cliConfiguredRoot],
    { env: cliConfigEnvironment, encoding: "utf8" },
  );
  assert.equal(cliConfigure.status, 0, cliConfigure.stderr);
  assert.equal(
    JSON.parse(cliConfigure.stdout).records_root,
    fs.realpathSync(cliConfiguredRoot),
  );
  const cliConfig = spawnSync(
    process.execPath,
    [cliScript, "config"],
    { env: cliConfigEnvironment, encoding: "utf8" },
  );
  assert.equal(cliConfig.status, 0, cliConfig.stderr);
  assert.equal(JSON.parse(cliConfig.stdout).source, "config");

  const configuredCliInput = baseStart("task-groundwork", "design", [
    {
      kind: "roadmap-task",
      source_type: "file",
      locator: "roadmap.md",
    },
  ]);
  configuredCliInput.task.task_number = "6.0";
  const configuredCliInputPath = path.join(
    temporaryRoot,
    "configured-cli-start.json",
  );
  fs.writeFileSync(configuredCliInputPath, JSON.stringify(configuredCliInput));
  const configuredCliStart = spawnSync(
    process.execPath,
    [cliScript, "start", configuredCliInputPath],
    { env: cliConfigEnvironment, encoding: "utf8" },
  );
  assert.equal(configuredCliStart.status, 0, configuredCliStart.stderr);
  assert.equal(
    JSON.parse(configuredCliStart.stdout).records_root_source,
    "config",
  );

  const concurrentInput = baseStart("task-groundwork", "design", [
    {
      kind: "roadmap-task",
      source_type: "file",
      locator: "roadmap.md",
    },
  ]);
  concurrentInput.task.task_number = "6.1";
  const concurrentInputPath = path.join(temporaryRoot, "concurrent-start.json");
  fs.writeFileSync(concurrentInputPath, JSON.stringify(concurrentInput));
  const concurrentEnvironment = {
    ...process.env,
    WORKFLOW_RECORDS_ROOT: recordsRoot,
  };
  const [concurrentA, concurrentB] = await Promise.all([
    spawnResult(process.execPath, [cliScript, "start", concurrentInputPath], {
      env: concurrentEnvironment,
    }),
    spawnResult(process.execPath, [cliScript, "start", concurrentInputPath], {
      env: concurrentEnvironment,
    }),
  ]);
  assert.equal(concurrentA.status, 0, concurrentA.stderr);
  assert.equal(concurrentB.status, 0, concurrentB.stderr);
  assert.equal(
    JSON.parse(concurrentA.stdout).run_id,
    JSON.parse(concurrentB.stdout).run_id,
  );

  const cliFinishPath = path.join(temporaryRoot, "cli-finish.json");
  fs.writeFileSync(
    cliFinishPath,
    JSON.stringify({
      output_sources: [
        {
          kind: "groundwork-output",
          source_type: "inline",
          locator: "CLI groundwork output.",
        },
      ],
      receipt: completionReceipt("CLI run completed."),
      observations: [],
      next: next("design", "to-spec", "CLI groundwork output"),
    }),
  );
  const concurrentRunId = JSON.parse(concurrentA.stdout).run_id;
  const [concurrentFinishA, concurrentFinishB] = await Promise.all([
    spawnResult(
      process.execPath,
      [cliScript, "finish", concurrentRunId, cliFinishPath],
      { env: concurrentEnvironment },
    ),
    spawnResult(
      process.execPath,
      [cliScript, "finish", concurrentRunId, cliFinishPath],
      { env: concurrentEnvironment },
    ),
  ]);
  assert.equal(concurrentFinishA.status, 0, concurrentFinishA.stderr);
  assert.equal(concurrentFinishB.status, 0, concurrentFinishB.stderr);
  assert.equal(
    JSON.parse(concurrentFinishA.stdout).record_id,
    JSON.parse(concurrentFinishB.stdout).record_id,
  );
  const cliStatus = spawnSync(
    process.execPath,
    [cliScript, "status", concurrentRunId],
    { env: concurrentEnvironment, encoding: "utf8" },
  );
  assert.equal(cliStatus.status, 0, cliStatus.stderr);
  const cliStatusResult = JSON.parse(cliStatus.stdout);
  assert.equal(cliStatusResult.status, "complete");
  assert.equal(Object.hasOwn(cliStatusResult, "sync_required"), false);

  const invalidCli = spawnSync(process.execPath, [cliScript, "unknown"], {
    env: concurrentEnvironment,
    encoding: "utf8",
  });
  assert.equal(invalidCli.status, 1);
  assert.match(invalidCli.stderr, /Usage:/);
  assert.doesNotMatch(invalidCli.stderr, /<skill-dir>/);

  const reorderedStartInput = baseStart(
    "revise-spec-from-review",
    "design",
    [specSource, reviewSource, taskContextSource],
    30,
  );
  reorderedStartInput.task.task_number = "10.1";
  const reorderedA = startWorkflowStep(reorderedStartInput, {
    env: environment,
  });
  const reorderedB = startWorkflowStep(
    {
      ...reorderedStartInput,
      input_sources: [...reorderedStartInput.input_sources].reverse(),
    },
    { env: environment },
  );
  assert.equal(reorderedA.run_id, reorderedB.run_id);

  const portableRecordsA = path.join(temporaryRoot, "portable-records-a");
  const portableRecordsB = path.join(temporaryRoot, "portable-records-b");
  initializeGitRepo(portableRecordsA, "portable-records-a");
  initializeGitRepo(portableRecordsB, "portable-records-b");
  const portableInput = baseStart(
    "task-groundwork",
    "design",
    [
      {
        kind: "roadmap-task",
        source_type: "file",
        locator: "roadmap.md",
      },
    ],
    1,
  );
  portableInput.project.id = "portable-project";
  portableInput.task.task_number = "9.1";
  const portableA = startWorkflowStep(portableInput, {
    env: { WORKFLOW_RECORDS_ROOT: portableRecordsA },
  });
  const portableClone = path.join(temporaryRoot, "portable-product-clone");
  run("git", ["clone", "-q", productRoot, portableClone], temporaryRoot);
  const portableCloneInput = {
    ...portableInput,
    project: { ...portableInput.project, repo_root: portableClone },
  };
  const portableCloneStart = startWorkflowStep(portableCloneInput, {
    env: { WORKFLOW_RECORDS_ROOT: portableRecordsA },
  });
  assert.equal(portableA.run_id, portableCloneStart.run_id);
  const portablePrInput = baseStart(
    "adversarial-diff-review",
    "review",
    [
      { kind: "pr", source_type: "pr", locator: 42 },
      taskContextSource,
    ],
    1,
  );
  portablePrInput.project.id = "portable-project";
  portablePrInput.task.task_number = "9.2";
  const portablePrA = startWorkflowStep(portablePrInput, {
    env: { WORKFLOW_RECORDS_ROOT: portableRecordsA },
    commandRunner: stablePrRunner,
  });
  run(
    "git",
    ["remote", "set-url", "origin", "git@example.invalid:product.git"],
    productRoot,
  );
  const portableB = startWorkflowStep(portableInput, {
    env: { WORKFLOW_RECORDS_ROOT: portableRecordsB },
  });
  const portablePrB = startWorkflowStep(portablePrInput, {
    env: { WORKFLOW_RECORDS_ROOT: portableRecordsB },
    commandRunner: stablePrRunner,
  });
  assert.equal(portableA.run_id, portableB.run_id);
  assert.equal(portablePrA.run_id, portablePrB.run_id);
  run(
    "git",
    [
      "remote",
      "set-url",
      "origin",
      "https://example.invalid/product.git",
    ],
    productRoot,
  );

  const noRemoteProduct = path.join(temporaryRoot, "no-remote-product");
  fs.mkdirSync(noRemoteProduct);
  run("git", ["init", "-q"], noRemoteProduct);
  run(
    "git",
    ["config", "user.email", "workflow@example.invalid"],
    noRemoteProduct,
  );
  run("git", ["config", "user.name", "Workflow Test"], noRemoteProduct);
  fs.writeFileSync(path.join(noRemoteProduct, "roadmap.md"), "# Roadmap\n");
  run("git", ["add", "roadmap.md"], noRemoteProduct);
  run("git", ["commit", "-qm", "docs: add roadmap"], noRemoteProduct);
  const noRemoteInput = baseStart("task-groundwork", "design", [
    {
      kind: "roadmap-task",
      source_type: "file",
      locator: "roadmap.md",
    },
  ]);
  noRemoteInput.project = {
    id: "no-remote-project",
    repo_root: noRemoteProduct,
  };
  noRemoteInput.task.task_number = "7.1";
  const noRemoteStart = startWorkflowStep(noRemoteInput, {
    env: environment,
  });
  assert.deepEqual(
    JSON.parse(fs.readFileSync(noRemoteStart.start_path, "utf8")).project,
    { id: "no-remote-project" },
  );

  process.stdout.write("workflow-step-record self-test: PASS\n");
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
