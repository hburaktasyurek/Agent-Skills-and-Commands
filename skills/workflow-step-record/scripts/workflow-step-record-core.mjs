import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

export const LIMITS = Object.freeze({
  max_file_bytes: 10 * 1024 * 1024,
  max_run_bytes: 50 * 1024 * 1024,
  max_manifest_files: 2000,
});

export const WORKFLOW_SKILLS = Object.freeze([
  "task-groundwork",
  "to-spec",
  "adversarial-spec-review",
  "revise-spec-from-review",
  "spec-readiness",
  "senior-implementer",
  "commit-work",
  "pr-branch",
  "adversarial-diff-review",
]);

const SESSION_TYPES = new Set([
  "design",
  "review",
  "implementation",
  "commit-pr",
]);
const SKILL_SESSION_TYPE = Object.freeze({
  "task-groundwork": "design",
  "to-spec": "design",
  "adversarial-spec-review": "review",
  "revise-spec-from-review": "design",
  "spec-readiness": "review",
  "senior-implementer": "implementation",
  "commit-work": "commit-pr",
  "pr-branch": "commit-pr",
  "adversarial-diff-review": "review",
});
const OBSERVATION_CATEGORIES = new Set([
  "input-gap",
  "handoff-loss",
  "skill-behavior",
  "model-behavior",
  "tool-limit",
  "ownership-drift",
  "manual-workaround",
  "review-defect",
]);
const SOURCE_TYPES = new Set([
  "inline",
  "file",
  "directory",
  "git-state",
  "commits",
  "pr",
]);

const START_REQUIREMENTS = Object.freeze({
  "task-groundwork": [["roadmap-task"]],
  "to-spec": [["groundwork-output"]],
  "adversarial-spec-review": [["spec-cluster"]],
  "revise-spec-from-review": [
    ["spec-cluster"],
    ["review-output", "readiness-output"],
    ["task-context"],
  ],
  "spec-readiness": [["spec-cluster"]],
  "senior-implementer": [["spec-cluster"]],
  "commit-work": [["git-state"]],
  "pr-branch": [["commits"]],
  "adversarial-diff-review": [
    ["pr"],
    ["task-context", "spec-cluster"],
  ],
});

const FINISH_REQUIREMENTS = Object.freeze({
  "task-groundwork": [["groundwork-output"]],
  "to-spec": [["spec-cluster"]],
  "adversarial-spec-review": [["review-output"]],
  "revise-spec-from-review": [["spec-cluster"]],
  "spec-readiness": [["readiness-output"]],
  "senior-implementer": [["git-state"]],
  "commit-work": [["commits"]],
  "pr-branch": [["pr"]],
  "adversarial-diff-review": [["diff-review-output"]],
});

const EXPECTED_SOURCE_TYPE = Object.freeze({
  "roadmap-task": new Set(["file"]),
  "groundwork-output": new Set(["inline", "file"]),
  "spec-cluster": new Set(["directory"]),
  "review-output": new Set(["inline", "file"]),
  "readiness-output": new Set(["inline", "file"]),
  "task-context": new Set(["inline", "file", "directory"]),
  "blocked-output": new Set(["inline", "file"]),
  "git-state": new Set(["git-state"]),
  commits: new Set(["commits"]),
  pr: new Set(["pr"]),
  "diff-review-output": new Set(["inline", "file"]),
});

const READ_ONLY_INPUT_SKILLS = new Set([
  "adversarial-spec-review",
  "spec-readiness",
  "adversarial-diff-review",
]);

const SECRET_PATTERNS = Object.freeze([
  /-----BEGIN (?:[A-Z0-9 ]+ )?PRIVATE KEY-----/,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{20,}\b/,
  /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/,
  /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/,
  /\bsk_live_[A-Za-z0-9]{16,}\b/,
  /\bsk-[A-Za-z0-9_-]{20,}\b/,
]);

const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const fail = (code, message) => {
  throw new Error(`${code}: ${message}`);
};

const requireObject = (value, field) => {
  if (!isObject(value)) fail("invalid-input", `${field} must be an object`);
  return value;
};

const requireString = (value, field) => {
  if (!isNonEmptyString(value)) {
    fail("invalid-input", `${field} must be a non-empty string`);
  }
  return value.trim();
};

const requireContentString = (value, field) => {
  if (typeof value !== "string" || value.length === 0) {
    fail("invalid-input", `${field} must be a non-empty string`);
  }
  return value;
};

const requireStringList = (value, field, { allowEmpty = false } = {}) => {
  if (
    !Array.isArray(value) ||
    (!allowEmpty && value.length === 0) ||
    value.some((item) => !isNonEmptyString(item))
  ) {
    fail(
      "invalid-input",
      `${field} must be ${allowEmpty ? "a" : "a non-empty"} string list`,
    );
  }
  return value.map((item) => item.trim());
};

const rejectUnknownKeys = (value, allowed, field) => {
  requireObject(value, field);
  const allowedKeys = new Set(allowed);
  for (const key of Object.keys(value)) {
    if (!allowedKeys.has(key)) {
      fail("invalid-input", `${field}.${key} is not allowed`);
    }
  }
};

const rejectStoredUnknownKeys = (value, allowed, field) => {
  requireObject(value, field);
  const allowedKeys = new Set(allowed);
  for (const key of Object.keys(value)) {
    if (!allowedKeys.has(key)) {
      fail("content-collision", `${field}.${key} is not allowed`);
    }
  }
};

const normalizeMetadataString = (value) =>
  value.normalize("NFC").replace(/\r\n?/g, "\n");

const canonicalize = (value) => {
  if (typeof value === "string") return normalizeMetadataString(value);
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!isObject(value)) return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonicalize(value[key])]),
  );
};

export const stableStringify = (value) =>
  JSON.stringify(canonicalize(value));

const prettyCanonicalJson = (value) =>
  `${JSON.stringify(canonicalize(value), null, 2)}\n`;

const sha256 = (value) =>
  createHash("sha256").update(value).digest("hex");

const defaultCommandRunner = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    encoding: options.encoding ?? null,
    maxBuffer: LIMITS.max_run_bytes + 1024 * 1024,
  });
  if (result.error) {
    if (result.error.code === "ENOBUFS") {
      fail(
        "snapshot-too-large",
        `${command} output exceeds the bounded capture buffer`,
      );
    }
    fail("tool-failed", `${command}: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const stderr = Buffer.isBuffer(result.stderr)
      ? result.stderr.toString("utf8")
      : String(result.stderr ?? "");
    fail(
      "tool-failed",
      `${command} ${args.join(" ")} exited ${result.status}: ${stderr.trim()}`,
    );
  }
  return Buffer.isBuffer(result.stdout)
    ? result.stdout
    : Buffer.from(String(result.stdout ?? ""));
};

const runText = (runner, command, args, cwd) =>
  runner(command, args, { cwd, encoding: "utf8" }).toString("utf8").trim();

const byteOrder = (left, right) =>
  Buffer.compare(Buffer.from(left), Buffer.from(right));

const normalizeArtifactPath = (value) => {
  if (
    !isNonEmptyString(value) ||
    value.includes("\\") ||
    path.posix.isAbsolute(value) ||
    value.split("/").some((segment) => segment === "." || segment === "..")
  ) {
    fail("path-traversal", `unsafe artifact path: ${value}`);
  }
  return value;
};

const validateSafeSegment = (value, field) => {
  const candidate = requireString(value, field);
  if (
    candidate.length > 64 ||
    !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(candidate)
  ) {
    fail(
      "path-traversal",
      `${field} must use only letters, digits, dot, underscore, and hyphen`,
    );
  }
  return candidate;
};

const validateRepoRelativePath = (value, field) => {
  const original = requireString(value, field);
  const candidate = original.replaceAll("\\", "/");
  if (
    path.posix.isAbsolute(candidate) ||
    path.win32.isAbsolute(original) ||
    candidate.split("/").some((segment) => segment === "..")
  ) {
    fail("path-traversal", `${field} must be a repo-relative path`);
  }
  return candidate;
};

const sanitizeRepository = (remote) => {
  if (!isNonEmptyString(remote)) return "unknown";
  const value = remote.trim();
  if (SECRET_PATTERNS.some((pattern) => pattern.test(value))) {
    fail("sensitive-content-blocked", "repository URL contains a secret");
  }
  if (/^[A-Za-z][A-Za-z0-9+.-]*:\/\//.test(value)) {
    const parsed = new URL(value);
    if (
      parsed.password ||
      (/^https?:$/i.test(parsed.protocol) && parsed.username)
    ) {
      fail(
        "sensitive-content-blocked",
        "repository URL contains credentials",
      );
    }
  }
  return value;
};

const canonicalRepositoryIdentity = (remote) => {
  const value = sanitizeRepository(remote);
  if (value === "unknown") return value;

  let host;
  let repositoryPath;
  if (/^[A-Za-z][A-Za-z0-9+.-]*:\/\//.test(value)) {
    const parsed = new URL(value);
    host = parsed.hostname.toLowerCase();
    repositoryPath = parsed.pathname;
  } else {
    const scpLike = value.match(/^(?:[^@/]+@)?([^:/]+):(.+)$/);
    if (!scpLike) return value.replace(/\.git$/i, "");
    [, host, repositoryPath] = scpLike;
    host = host.toLowerCase();
  }
  const normalizedPath = repositoryPath
    .replace(/^\/+|\/+$/g, "")
    .replace(/\.git$/i, "");
  return normalizedPath ? `${host}/${normalizedPath}` : host;
};

const ensureGitRoot = (candidate, runner, field) => {
  if (!path.isAbsolute(candidate)) {
    fail("invalid-input", `${field} must be an absolute path`);
  }
  const resolved = fs.realpathSync(candidate);
  const gitRoot = fs.realpathSync(
    runText(runner, "git", ["rev-parse", "--show-toplevel"], resolved),
  );
  if (gitRoot !== resolved) {
    fail("invalid-input", `${field} must be the exact Git worktree root`);
  }
  return resolved;
};

const defaultConfigPath = (options = {}) => {
  const env = options.env ?? process.env;
  const homeDirectory = options.homeDirectory ?? os.homedir();
  const configBase = isNonEmptyString(env?.XDG_CONFIG_HOME)
    ? path.resolve(env.XDG_CONFIG_HOME)
    : path.join(homeDirectory, ".config");
  return path.join(configBase, "workflow-step-record", "config.json");
};

const defaultRecordsRoot = (options = {}) => {
  const homeDirectory = options.homeDirectory ?? os.homedir();
  return path.join(homeDirectory, "workflow-records");
};

const ensureNormalDirectory = (candidate, field, { create = false } = {}) => {
  if (!path.isAbsolute(candidate)) {
    fail("invalid-input", `${field} must be an absolute path`);
  }
  if (create) {
    fs.mkdirSync(candidate, { recursive: true, mode: 0o700 });
  }
  if (!fs.existsSync(candidate)) {
    fail("invalid-input", `${field} does not exist: ${candidate}`);
  }
  const stat = fs.lstatSync(candidate);
  if (stat.isSymbolicLink()) {
    fail("symlink-rejected", `${field} must not be a symlink`);
  }
  if (!stat.isDirectory()) {
    fail("invalid-input", `${field} must be a directory`);
  }
  return fs.realpathSync(candidate);
};

const validateOptionalRecordsGitRemote = (
  recordsRoot,
  runner = defaultCommandRunner,
) => {
  try {
    runText(runner, "git", ["rev-parse", "--show-toplevel"], recordsRoot);
  } catch {
    return false;
  }
  let remote;
  try {
    remote = runText(
      runner,
      "git",
      ["config", "--get", "remote.origin.url"],
      recordsRoot,
    );
  } catch {
    return false;
  }
  sanitizeRepository(remote);
  return true;
};

const readRecordsConfig = (options = {}) => {
  const configPath = defaultConfigPath(options);
  if (!fs.existsSync(configPath)) return null;
  const stat = fs.lstatSync(configPath);
  if (stat.isSymbolicLink()) {
    fail("symlink-rejected", "workflow-step-record config must not be a symlink");
  }
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch (error) {
    fail(
      "invalid-config",
      `${configPath} is not valid JSON: ${
        error instanceof Error ? error.message : error
      }`,
    );
  }
  rejectUnknownKeys(
    parsed,
    ["schema_version", "records_root"],
    "workflow-step-record config",
  );
  if (parsed.schema_version !== 1) {
    fail("invalid-config", "config schema_version must be 1");
  }
  const recordsRoot = requireString(
    parsed.records_root,
    "workflow-step-record config.records_root",
  );
  if (!path.isAbsolute(recordsRoot)) {
    fail("invalid-config", "config records_root must be an absolute path");
  }
  return { configPath, recordsRoot };
};

const resolveRecordsRoot = (explicit, options = {}) => {
  const env = options.env ?? process.env;
  const environmentRoot = env?.WORKFLOW_RECORDS_ROOT;
  let selected;
  let source;
  if (isNonEmptyString(explicit)) {
    selected = explicit;
    source = "input";
  } else if (isNonEmptyString(environmentRoot)) {
    selected = environmentRoot;
    source = "environment";
  } else {
    const config = readRecordsConfig(options);
    if (config) {
      selected = config.recordsRoot;
      source = "config";
    } else {
      selected = defaultRecordsRoot(options);
      source = "default";
    }
  }

  const root = ensureNormalDirectory(
    path.resolve(selected),
    "records_root",
    { create: true },
  );
  const syncRequired = validateOptionalRecordsGitRemote(
    root,
    options.commandRunner ?? defaultCommandRunner,
  );
  return {
    root,
    source,
    configPath: defaultConfigPath(options),
    syncRequired,
  };
};

const publishConfig = (configPath, document) => {
  fs.mkdirSync(path.dirname(configPath), { recursive: true, mode: 0o700 });
  if (
    fs.existsSync(configPath) &&
    fs.lstatSync(configPath).isSymbolicLink()
  ) {
    fail("symlink-rejected", "workflow-step-record config must not be a symlink");
  }
  const temporaryPath = `${configPath}.${process.pid}.${Date.now()}.tmp`;
  try {
    fs.writeFileSync(temporaryPath, prettyCanonicalJson(document), {
      encoding: "utf8",
      mode: 0o600,
      flag: "wx",
    });
    fs.renameSync(temporaryPath, configPath);
  } finally {
    if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath);
  }
};

export function configureWorkflowRecordsRoot(candidate, options = {}) {
  const recordsRoot = ensureNormalDirectory(
    path.resolve(requireString(candidate, "records_root")),
    "records_root",
    { create: true },
  );
  const syncRequired = validateOptionalRecordsGitRemote(
    recordsRoot,
    options.commandRunner ?? defaultCommandRunner,
  );
  const configPath = defaultConfigPath(options);
  publishConfig(configPath, {
    schema_version: 1,
    records_root: recordsRoot,
  });
  return {
    config_path: configPath,
    records_root: recordsRoot,
    source: "config",
    sync_required: syncRequired,
  };
}

export function getWorkflowRecordsConfiguration(options = {}) {
  const resolved = resolveRecordsRoot(undefined, options);
  return {
    config_path: resolved.configPath,
    records_root: resolved.root,
    source: resolved.source,
    sync_required: resolved.syncRequired,
  };
}

const resolveProjectRoot = (candidate, runner) =>
  ensureGitRoot(
    path.resolve(requireString(candidate, "project.repo_root")),
    runner,
    "project.repo_root",
  );

const repositoryForRepo = (runner, repoRoot) => {
  try {
    return sanitizeRepository(
      runText(
        runner,
        "git",
        ["config", "--get", "remote.origin.url"],
        repoRoot,
      ),
    );
  } catch (error) {
    if (
      error instanceof Error &&
      /git config --get remote\.origin\.url exited 1:/.test(error.message)
    ) {
      return "unknown";
    }
    throw error;
  }
};

const assertNoSymlinkComponents = (root, relative) => {
  let current = root;
  for (const segment of relative.split("/").filter(Boolean)) {
    current = path.join(current, segment);
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) {
      fail("symlink-rejected", `path contains symlink: ${relative}`);
    }
  }
};

const safeRepoPath = (repoRoot, locator, expectedDirectory = false) => {
  const original = requireString(locator, "source.locator");
  const relative = original.replaceAll(
    "\\",
    "/",
  );
  if (
    path.posix.isAbsolute(relative) ||
    path.win32.isAbsolute(original) ||
    relative.split("/").includes("..")
  ) {
    fail("path-traversal", `artifact path escapes project root: ${relative}`);
  }
  const resolved = path.resolve(repoRoot, ...relative.split("/"));
  const relation = path.relative(repoRoot, resolved);
  if (relation.startsWith("..") || path.isAbsolute(relation)) {
    fail("path-traversal", `artifact path escapes project root: ${relative}`);
  }
  assertNoSymlinkComponents(repoRoot, relative);
  const stat = fs.lstatSync(resolved);
  if (stat.isSymbolicLink()) {
    fail("symlink-rejected", `artifact is a symlink: ${relative}`);
  }
  if (expectedDirectory && !stat.isDirectory()) {
    fail("invalid-input", `artifact is not a directory: ${relative}`);
  }
  if (!expectedDirectory && !stat.isFile()) {
    fail("invalid-input", `artifact is not a regular file: ${relative}`);
  }
  return { resolved, relative };
};

const ensureStorageDirectory = (recordsRoot, directory) => {
  const relative = path.relative(recordsRoot, directory);
  if (
    relative.startsWith("..") ||
    path.isAbsolute(relative) ||
    relative.split(path.sep).includes("..")
  ) {
    fail("path-traversal", `storage path escapes records root: ${directory}`);
  }
  let current = recordsRoot;
  for (const segment of relative.split(path.sep).filter(Boolean)) {
    current = path.join(current, segment);
    if (fs.existsSync(current)) {
      const stat = fs.lstatSync(current);
      if (stat.isSymbolicLink()) {
        fail("symlink-rejected", `storage path contains symlink: ${current}`);
      }
      if (!stat.isDirectory()) {
        fail("content-collision", `storage component is not a directory: ${current}`);
      }
    } else {
      try {
        fs.mkdirSync(current);
      } catch (error) {
        if (error?.code !== "EEXIST") throw error;
      }
    }
  }
};

const checkFileLimit = (buffer, name) => {
  if (buffer.length > LIMITS.max_file_bytes) {
    fail(
      "snapshot-too-large",
      `${name} exceeds ${LIMITS.max_file_bytes} bytes`,
    );
  }
};

const scanSensitiveContent = (buffer, name) => {
  const text = buffer.toString("latin1");
  if (SECRET_PATTERNS.some((pattern) => pattern.test(text))) {
    fail("sensitive-content-blocked", `secret signature found in ${name}`);
  }
};

const collectDirectory = (
  root,
  prefix = "",
  maxFiles = LIMITS.max_manifest_files,
) => {
  const files = [];
  const walk = (directory, relativeDirectory) => {
    const entries = fs
      .readdirSync(directory, { withFileTypes: true })
      .sort((left, right) => byteOrder(left.name, right.name));
    for (const entry of entries) {
      const relative = path.posix.join(relativeDirectory, entry.name);
      const absolute = path.join(directory, entry.name);
      const stat = fs.lstatSync(absolute);
      if (stat.isSymbolicLink()) {
        fail("symlink-rejected", `snapshot contains symlink: ${relative}`);
      }
      if (stat.isDirectory()) {
        walk(absolute, relative);
      } else if (stat.isFile()) {
        files.push({
          path: path.posix.join(prefix, relative),
          content: fs.readFileSync(absolute),
        });
      }
      if (files.length > maxFiles) {
        fail(
          "snapshot-too-large",
          `snapshot exceeds ${maxFiles} files`,
        );
      }
    }
  };
  walk(root, "");
  return files;
};

const sameCapturedFiles = (left, right) =>
  left.length === right.length &&
  left.every(
    (file, index) =>
      file.path === right[index].path &&
      Buffer.compare(file.content, right[index].content) === 0,
  );

const collectStableDirectory = (root, prefix = "") => {
  const first = collectDirectory(root, prefix);
  const second = collectDirectory(root, prefix);
  if (!sameCapturedFiles(first, second)) {
    fail(
      "input-mutated-during-capture",
      `directory changed while being snapshotted: ${root}`,
    );
  }
  return first;
};

const readStableFile = (filePath) => {
  const first = fs.readFileSync(filePath);
  const second = fs.readFileSync(filePath);
  if (Buffer.compare(first, second) !== 0) {
    fail(
      "input-mutated-during-capture",
      `file changed while being snapshotted: ${filePath}`,
    );
  }
  return first;
};

const gitMetadata = (runner, repoRoot) => ({
  branch:
    runText(runner, "git", ["branch", "--show-current"], repoRoot) ||
    "detached",
  head: runText(runner, "git", ["rev-parse", "HEAD"], repoRoot),
});

const captureGitStateOnce = (runner, repoRoot) => {
  const metadata = gitMetadata(runner, repoRoot);
  const files = [
    {
      path: "metadata.json",
      content: Buffer.from(prettyCanonicalJson(metadata)),
    },
    {
      path: "status.bin",
      content: runner("git", ["status", "--porcelain=v1", "-z"], {
        cwd: repoRoot,
      }),
    },
    {
      path: "staged.diff",
      content: runner("git", ["diff", "--cached", "--binary", "--no-ext-diff"], {
        cwd: repoRoot,
      }),
    },
    {
      path: "unstaged.diff",
      content: runner("git", ["diff", "--binary", "--no-ext-diff"], {
        cwd: repoRoot,
      }),
    },
  ];
  const untracked = runner(
    "git",
    ["ls-files", "--others", "--exclude-standard", "-z"],
    { cwd: repoRoot },
  )
    .toString("utf8")
    .split("\0")
    .filter(Boolean)
    .sort();
  for (const relative of untracked) {
    const candidate = safeRepoPath(repoRoot, relative, false);
    files.push({
      path: path.posix.join("untracked", candidate.relative),
      content: readStableFile(candidate.resolved),
    });
  }
  return { reference: "git-state", files };
};

const captureGitState = (runner, repoRoot) => {
  const first = captureGitStateOnce(runner, repoRoot);
  const second = captureGitStateOnce(runner, repoRoot);
  if (!sameCapturedFiles(first.files, second.files)) {
    fail(
      "input-mutated-during-capture",
      "Git state changed while being snapshotted",
    );
  }
  return first;
};

const captureCommits = (runner, repoRoot, locator) => {
  const commits = Array.isArray(locator)
    ? locator.map((item, index) => requireString(item, `locator[${index}]`))
    : [requireString(locator, "source.locator")];
  if (commits.some((commit) => !/^[0-9a-fA-F]{7,64}$/.test(commit))) {
    fail("invalid-input", "commit locators must be Git object IDs");
  }
  const repositoryStateBefore = gitMetadata(runner, repoRoot);
  const exact = commits.map((commit) =>
    runText(runner, "git", ["rev-parse", `${commit}^{commit}`], repoRoot),
  );
  const patch = runner(
    "git",
    ["show", "--binary", "--format=fuller", "--no-ext-diff", ...exact],
    { cwd: repoRoot },
  );
  const repositoryStateAfter = gitMetadata(runner, repoRoot);
  if (
    stableStringify(repositoryStateBefore) !==
    stableStringify(repositoryStateAfter)
  ) {
    fail(
      "input-mutated-during-capture",
      "repository branch or HEAD changed during commit snapshot",
    );
  }
  return {
    reference: exact.join(","),
    files: [
      {
        path: "metadata.json",
        content: Buffer.from(
          prettyCanonicalJson({
            ...repositoryStateBefore,
            commits: exact,
          }),
        ),
      },
      { path: "commits.patch", content: patch },
    ],
  };
};

const capturePr = (runner, repoRoot, locator) => {
  const prNumber = String(locator);
  if (!/^[1-9][0-9]*$/.test(prNumber)) {
    fail("invalid-input", "PR locator must be a positive integer");
  }
  const viewArgs = [
    "pr",
    "view",
    prNumber,
    "--json",
    "number,url,baseRefName,baseRefOid,headRefName,headRefOid",
  ];
  const repositoryBefore = canonicalRepositoryIdentity(
    repositoryForRepo(runner, repoRoot),
  );
  const before = JSON.parse(runText(runner, "gh", viewArgs, repoRoot));
  const patch = runner("gh", ["pr", "diff", prNumber, "--patch"], {
    cwd: repoRoot,
  });
  const after = JSON.parse(runText(runner, "gh", viewArgs, repoRoot));
  const repositoryAfter = canonicalRepositoryIdentity(
    repositoryForRepo(runner, repoRoot),
  );
  if (
    stableStringify(before) !== stableStringify(after) ||
    repositoryBefore !== repositoryAfter
  ) {
    fail("pr-head-changed", `PR ${prNumber} changed during snapshot`);
  }
  const metadata = {
    ...before,
    repository: repositoryBefore,
  };
  return {
    reference: `PR ${prNumber}@${before.headRefOid}`,
    files: [
      {
        path: "metadata.json",
        content: Buffer.from(prettyCanonicalJson(metadata)),
      },
      { path: "pr.patch", content: patch },
    ],
  };
};

const buildArtifact = (source, repoRoot, runner) => {
  requireObject(source, "source");
  rejectUnknownKeys(source, ["kind", "source_type", "locator"], "source");
  const kind = requireString(source.kind, "source.kind");
  const sourceType = requireString(source.source_type, "source.source_type");
  if (!SOURCE_TYPES.has(sourceType)) {
    fail("invalid-input", `unsupported source_type: ${sourceType}`);
  }
  if (!EXPECTED_SOURCE_TYPE[kind]?.has(sourceType)) {
    fail(
      "invalid-input",
      `${kind} does not accept source_type ${sourceType}`,
    );
  }

  let captured;
  if (sourceType === "inline") {
    const content = Buffer.from(
      requireContentString(source.locator, "source.locator"),
    );
    captured = {
      reference: "inline",
      files: [{ path: "content.txt", content }],
    };
  } else if (sourceType === "file") {
    const candidate = safeRepoPath(repoRoot, source.locator, false);
    captured = {
      reference: candidate.relative,
      files: [
        {
          path: path.posix.join("files", candidate.relative),
          content: readStableFile(candidate.resolved),
        },
      ],
    };
  } else if (sourceType === "directory") {
    const candidate = safeRepoPath(repoRoot, source.locator, true);
    captured = {
      reference: candidate.relative,
      files: collectStableDirectory(candidate.resolved, "files"),
    };
  } else if (sourceType === "git-state") {
    captured = captureGitState(runner, repoRoot);
  } else if (sourceType === "commits") {
    captured = captureCommits(runner, repoRoot, source.locator);
  } else {
    captured = capturePr(runner, repoRoot, source.locator);
  }

  if (captured.files.length === 0) {
    fail("missing-artifact", `${kind} snapshot contains no files`);
  }
  if (captured.files.length > LIMITS.max_manifest_files) {
    fail(
      "snapshot-too-large",
      `${kind} exceeds ${LIMITS.max_manifest_files} files`,
    );
  }
  const manifestFiles = captured.files
    .map((file) => {
      file.path = normalizeMetadataString(normalizeArtifactPath(file.path));
      checkFileLimit(file.content, file.path);
      scanSensitiveContent(file.content, file.path);
      return {
        path: file.path,
        sha256: sha256(file.content),
        size: file.content.length,
      };
    })
    .sort((left, right) => byteOrder(left.path, right.path));
  if (
    new Set(manifestFiles.map(({ path: artifactPath }) => artifactPath)).size !==
    manifestFiles.length
  ) {
    fail(
      "content-collision",
      `${kind} contains paths that collide after Unicode normalization`,
    );
  }
  const manifest = canonicalize({
    kind,
    source_type: sourceType,
    reference: normalizeMetadataString(captured.reference),
    files: manifestFiles,
  });
  const manifestBuffer = Buffer.from(prettyCanonicalJson(manifest));
  checkFileLimit(manifestBuffer, `${kind} manifest`);
  scanSensitiveContent(manifestBuffer, `${kind} manifest`);
  const digest = sha256(stableStringify(manifest));
  return {
    descriptor: {
      kind,
      source_type: sourceType,
      reference: manifest.reference,
      digest: `sha256:${digest}`,
      size: manifestFiles.reduce((total, file) => total + file.size, 0),
      file_count: manifestFiles.length,
    },
    manifest,
    files: captured.files,
  };
};

const ensureRequirements = (
  skill,
  sources,
  requirements,
  field,
  { blocked = false } = {},
) => {
  if (!Array.isArray(sources) || sources.length === 0) {
    fail("missing-artifact", `${field} must contain artifacts`);
  }
  const kinds = new Set(sources.map((source) => source?.kind));
  if (blocked) {
    if (!kinds.has("blocked-output")) {
      fail(
        "missing-artifact",
        `${skill} blocked finish requires blocked-output`,
      );
    }
  } else {
    for (const alternatives of requirements[skill]) {
      if (!alternatives.some((kind) => kinds.has(kind))) {
        fail(
          "missing-artifact",
          `${skill} requires ${alternatives.join(" or ")} in ${field}`,
        );
      }
    }
  }
  const allowed = new Set(requirements[skill].flat());
  if (blocked) allowed.add("blocked-output");
  if (skill === "task-groundwork" && field === "output_sources") {
    allowed.add("roadmap-task");
  }
  for (const kind of kinds) {
    if (!allowed.has(kind)) {
      fail("invalid-input", `${skill} does not accept ${kind} in ${field}`);
    }
  }
};

const captureArtifacts = (sources, repoRoot, runner) => {
  const artifacts = sources
    .map((source) => buildArtifact(source, repoRoot, runner))
    .sort((left, right) =>
      byteOrder(
        stableStringify(left.descriptor),
        stableStringify(right.descriptor),
      ),
    );
  const totalSize = artifacts.reduce(
    (total, artifact) => total + artifact.descriptor.size,
    0,
  );
  return { artifacts, totalSize };
};

const sleepSync = (milliseconds) => {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
};

const waitForArtifactManifest = (target) => {
  const manifestPath = path.join(target, "manifest.json");
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (fs.existsSync(manifestPath)) return;
    sleepSync(10);
  }
  fail(
    "content-collision",
    `artifact target is incomplete after publication wait: ${target}`,
  );
};

const verifyStoredArtifact = (recordsRoot, descriptor) => {
  const digest = requireString(descriptor.digest, "artifact.digest");
  if (!/^sha256:[0-9a-f]{64}$/.test(digest)) {
    fail("content-collision", `invalid artifact digest: ${digest}`);
  }
  const target = path.join(
    recordsRoot,
    "artifacts",
    "sha256",
    digest.slice("sha256:".length),
  );
  if (!fs.existsSync(target) || !fs.lstatSync(target).isDirectory()) {
    fail("content-collision", `artifact directory is missing: ${target}`);
  }
  if (fs.lstatSync(target).isSymbolicLink()) {
    fail("symlink-rejected", `artifact target is a symlink: ${target}`);
  }
  waitForArtifactManifest(target);
  const manifestPath = path.join(target, "manifest.json");
  if (fs.lstatSync(manifestPath).isSymbolicLink()) {
    fail("symlink-rejected", `artifact manifest is a symlink: ${manifestPath}`);
  }
  const manifestText = fs.readFileSync(manifestPath, "utf8");
  let manifest;
  try {
    manifest = JSON.parse(manifestText);
  } catch {
    fail("content-collision", `artifact manifest is invalid JSON: ${target}`);
  }
  if (manifestText !== prettyCanonicalJson(manifest)) {
    fail("content-collision", `artifact manifest is not canonical: ${target}`);
  }
  if (`sha256:${sha256(stableStringify(manifest))}` !== digest) {
    fail("content-collision", `artifact manifest digest differs: ${target}`);
  }
  if (!Array.isArray(manifest.files)) {
    fail("content-collision", `artifact manifest has no file list: ${target}`);
  }
  const expectedDescriptor = canonicalize({
    kind: manifest.kind,
    source_type: manifest.source_type,
    reference: manifest.reference,
    digest,
    size: manifest.files.reduce((total, file) => total + file.size, 0),
    file_count: manifest.files.length,
  });
  if (stableStringify(expectedDescriptor) !== stableStringify(descriptor)) {
    fail("content-collision", `artifact descriptor differs: ${target}`);
  }

  const actualFiles = collectDirectory(
    target,
    "",
    LIMITS.max_manifest_files + 1,
  ).filter(
    ({ path: artifactPath }) => artifactPath !== "manifest.json",
  );
  if (actualFiles.length !== manifest.files.length) {
    fail("content-collision", `artifact file count differs: ${target}`);
  }
  const actualByPath = new Map(
    actualFiles.map((file) => [file.path, file.content]),
  );
  for (const file of manifest.files) {
    const artifactPath = normalizeArtifactPath(file.path);
    const content = actualByPath.get(artifactPath);
    if (
      !content ||
      content.length !== file.size ||
      sha256(content) !== file.sha256
    ) {
      fail(
        "content-collision",
        `artifact payload differs: ${target}/${artifactPath}`,
      );
    }
  }
  return target;
};

const publishArtifact = (recordsRoot, artifact) => {
  const digest = artifact.descriptor.digest.slice("sha256:".length);
  const parent = path.join(recordsRoot, "artifacts", "sha256");
  const target = path.join(parent, digest);
  ensureStorageDirectory(recordsRoot, parent);
  const expectedManifest = prettyCanonicalJson(artifact.manifest);
  if (fs.existsSync(target)) {
    return verifyStoredArtifact(recordsRoot, artifact.descriptor);
  }

  const temporary = fs.mkdtempSync(path.join(parent, ".tmp-"));
  let ownsTarget = false;
  try {
    fs.writeFileSync(path.join(temporary, "manifest.json"), expectedManifest);
    for (const file of artifact.files) {
      const destination = path.join(temporary, ...file.path.split("/"));
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.writeFileSync(destination, file.content);
    }
    try {
      fs.mkdirSync(target);
      ownsTarget = true;
    } catch (error) {
      if (error?.code !== "EEXIST" || !fs.existsSync(target)) throw error;
      return verifyStoredArtifact(recordsRoot, artifact.descriptor);
    }
    for (const file of artifact.files) {
      const destination = path.join(target, ...file.path.split("/"));
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.linkSync(
        path.join(temporary, ...file.path.split("/")),
        destination,
      );
    }
    fs.linkSync(
      path.join(temporary, "manifest.json"),
      path.join(target, "manifest.json"),
    );
    return verifyStoredArtifact(recordsRoot, artifact.descriptor);
  } catch (error) {
    if (ownsTarget) {
      fs.rmSync(target, { recursive: true, force: true });
    }
    throw error;
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
};

const publishJsonExclusive = (recordsRoot, target, document) => {
  const content = prettyCanonicalJson(document);
  ensureStorageDirectory(recordsRoot, path.dirname(target));
  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isSymbolicLink()) {
      fail("symlink-rejected", `canonical target is a symlink: ${target}`);
    }
    if (fs.readFileSync(target, "utf8") !== content) {
      fail("content-collision", `${target} already has different content`);
    }
    return false;
  }
  const temporaryDirectory = fs.mkdtempSync(
    path.join(path.dirname(target), ".tmp-json-"),
  );
  const temporary = path.join(temporaryDirectory, "document.json");
  try {
    fs.writeFileSync(temporary, content, { flag: "wx" });
    try {
      fs.linkSync(temporary, target);
    } catch (error) {
      if (error?.code !== "EEXIST" || !fs.existsSync(target)) throw error;
      if (fs.readFileSync(target, "utf8") !== content) {
        fail("content-collision", `${target} already has different content`);
      }
      return false;
    }
  } finally {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  }
  return true;
};

const reserveAttempt = (recordsRoot, taskRoot, skill, attempt, runId) => {
  const attemptPath = path.join(
    taskRoot,
    "attempts",
    `${skill}-${attempt}.json`,
  );
  const document = { attempt, run_id: runId, skill };
  try {
    publishJsonExclusive(recordsRoot, attemptPath, document);
  } catch (error) {
    if (fs.existsSync(attemptPath)) {
      const existing = JSON.parse(fs.readFileSync(attemptPath, "utf8"));
      if (existing.run_id !== runId) {
        fail(
          "attempt-collision",
          `${skill} attempt ${attempt} already belongs to ${existing.run_id}`,
        );
      }
    }
    throw error;
  }
  return attemptPath;
};

const findRunDirectory = (recordsRoot, runId) => {
  if (!/^sha256:[0-9a-f]{64}$/.test(runId)) {
    fail("invalid-input", "run_id must be sha256:<64 lowercase hex>");
  }
  const projectsRoot = path.join(recordsRoot, "projects");
  if (!fs.existsSync(projectsRoot)) {
    fail("run-not-found", `run ${runId} does not exist`);
  }
  const candidates = [];
  for (const project of fs.readdirSync(projectsRoot, {
    withFileTypes: true,
  })) {
    if (!project.isDirectory() || project.isSymbolicLink()) continue;
    const tasksRoot = path.join(projectsRoot, project.name, "tasks");
    if (!fs.existsSync(tasksRoot)) continue;
    for (const task of fs.readdirSync(tasksRoot, { withFileTypes: true })) {
      if (!task.isDirectory() || task.isSymbolicLink()) continue;
      const candidate = path.join(
        tasksRoot,
        task.name,
        "runs",
        runId.slice("sha256:".length),
      );
      if (fs.existsSync(path.join(candidate, "start.json"))) {
        candidates.push(candidate);
      }
    }
  }
  if (candidates.length !== 1) {
    fail(
      candidates.length === 0 ? "run-not-found" : "run-collision",
      `expected one run for ${runId}, found ${candidates.length}`,
    );
  }
  return candidates[0];
};

const normalizeReceipt = (skill, receipt) => {
  requireObject(receipt, "receipt");
  if (receipt.kind === "completion" && receipt.status === "blocked") {
    rejectUnknownKeys(
      receipt,
      ["kind", "status", "evidence", "blocked_reason"],
      "receipt",
    );
    return {
      receipt: {
        kind: "completion",
        status: "blocked",
        evidence: requireStringList(receipt.evidence, "receipt.evidence"),
        blocked_reason: requireString(
          receipt.blocked_reason,
          "receipt.blocked_reason",
        ),
      },
      result: "blocked",
    };
  }
  if (
    ["adversarial-spec-review", "adversarial-diff-review"].includes(skill)
  ) {
    if (receipt.kind !== "adversarial-review") {
      fail("ambiguous-verdict", `${skill} requires adversarial-review receipt`);
    }
    rejectUnknownKeys(
      receipt,
      [
        "kind",
        "verdict_line",
        "coverage",
        "current_findings",
        "blocked_reason",
      ],
      "receipt",
    );
    const verdictLine = requireString(
      receipt.verdict_line,
      "receipt.verdict_line",
    );
    if (!["complete", "partial"].includes(receipt.coverage)) {
      fail("ambiguous-verdict", "review coverage must be complete or partial");
    }
    if (!Array.isArray(receipt.current_findings)) {
      fail("ambiguous-verdict", "current_findings must be an array");
    }
    const findings = receipt.current_findings.map((finding, index) => {
      requireObject(finding, `receipt.current_findings[${index}]`);
      rejectUnknownKeys(
        finding,
        ["id", "severity"],
        `receipt.current_findings[${index}]`,
      );
      const id = requireString(
        finding.id,
        `receipt.current_findings[${index}].id`,
      );
      if (!["P0", "P1", "P2", "P3"].includes(finding.severity)) {
        fail("ambiguous-verdict", `invalid finding severity for ${id}`);
      }
      return { id, severity: finding.severity };
    });
    const normalized = {
      kind: "adversarial-review",
      verdict_line: verdictLine,
      coverage: receipt.coverage,
      current_findings: findings,
    };
    if (Object.hasOwn(receipt, "blocked_reason")) {
      normalized.blocked_reason = requireString(
        receipt.blocked_reason,
        "receipt.blocked_reason",
      );
    }
    return {
      receipt: normalized,
      result: normalized.blocked_reason
        ? "blocked"
        : normalized.coverage === "partial"
          ? "incomplete"
          : findings.some(({ severity }) => ["P0", "P1"].includes(severity))
            ? "fail"
            : "pass",
    };
  }
  if (skill === "spec-readiness") {
    if (receipt.kind !== "readiness") {
      fail("ambiguous-verdict", "spec-readiness requires readiness receipt");
    }
    rejectUnknownKeys(
      receipt,
      ["kind", "verdict_line", "blocker_count"],
      "receipt",
    );
    if (
      !["READY", "NOT READY"].includes(receipt.verdict_line) ||
      !Number.isInteger(receipt.blocker_count) ||
      receipt.blocker_count < 0
    ) {
      fail("ambiguous-verdict", "invalid readiness receipt");
    }
    const normalized = {
      kind: "readiness",
      verdict_line: receipt.verdict_line,
      blocker_count: receipt.blocker_count,
    };
    if (receipt.verdict_line === "READY" && receipt.blocker_count === 0) {
      return { receipt: normalized, result: "pass" };
    }
    if (receipt.verdict_line === "NOT READY" && receipt.blocker_count > 0) {
      return { receipt: normalized, result: "fail" };
    }
    fail("ambiguous-verdict", "readiness verdict contradicts blocker_count");
  }
  if (receipt.kind !== "completion") {
    fail("ambiguous-verdict", `${skill} requires completion receipt`);
  }
  rejectUnknownKeys(
    receipt,
    ["kind", "status", "evidence", "blocked_reason"],
    "receipt",
  );
  if (!["completed", "blocked"].includes(receipt.status)) {
    fail("ambiguous-verdict", "completion status must be completed or blocked");
  }
  const evidence = requireStringList(receipt.evidence, "receipt.evidence");
  if (
    receipt.status === "blocked" &&
    !isNonEmptyString(receipt.blocked_reason)
  ) {
    fail("ambiguous-verdict", "blocked completion requires blocked_reason");
  }
  if (
    receipt.status === "completed" &&
    Object.hasOwn(receipt, "blocked_reason")
  ) {
    fail(
      "ambiguous-verdict",
      "completed receipt must not contain blocked_reason",
    );
  }
  return {
    receipt: {
      kind: "completion",
      status: receipt.status,
      evidence,
      ...(receipt.status === "blocked"
        ? {
            blocked_reason: requireString(
              receipt.blocked_reason,
              "receipt.blocked_reason",
            ),
          }
        : {}),
    },
    result: receipt.status,
  };
};

const normalizeReceiptForFinish = (skill, receipt) => {
  try {
    return normalizeReceipt(skill, receipt);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("invalid-input: receipt") &&
      !error.message.includes("is not allowed")
    ) {
      fail(
        "ambiguous-verdict",
        error.message.slice("invalid-input: ".length),
      );
    }
    throw error;
  }
};

const validateObservations = (observations) => {
  if (!Array.isArray(observations)) {
    fail("invalid-input", "observations must be an array");
  }
  return observations.map((observation, index) => {
    requireObject(observation, `observations[${index}]`);
    rejectUnknownKeys(
      observation,
      ["category", "summary", "evidence", "workaround"],
      `observations[${index}]`,
    );
    if (!OBSERVATION_CATEGORIES.has(observation.category)) {
      fail(
        "invalid-input",
        `invalid observation category: ${observation.category}`,
      );
    }
    const normalized = {
      category: observation.category,
      summary: requireString(
        observation.summary,
        `observations[${index}].summary`,
      ),
      evidence: requireStringList(
        observation.evidence,
        `observations[${index}].evidence`,
      ),
    };
    if (Object.hasOwn(observation, "workaround")) {
      normalized.workaround = requireString(
        observation.workaround,
        `observations[${index}].workaround`,
      );
    }
    return normalized;
  });
};

const validateNext = (next) => {
  requireObject(next, "next");
  rejectUnknownKeys(
    next,
    ["session_type", "skill", "input_reference"],
    "next",
  );
  if (!SESSION_TYPES.has(next.session_type)) {
    fail("invalid-input", "next.session_type is invalid");
  }
  const nextSkill = requireString(next.skill, "next.skill");
  if (![...WORKFLOW_SKILLS, "human-action"].includes(nextSkill)) {
    fail(
      "invalid-input",
      `next.skill is outside the canonical workflow: ${nextSkill}`,
    );
  }
  return {
    session_type: next.session_type,
    skill: nextSkill,
    input_reference: requireString(
      next.input_reference,
      "next.input_reference",
    ),
  };
};

const validateDocumentPayload = (document, name) => {
  const content = Buffer.from(prettyCanonicalJson(document));
  checkFileLimit(content, name);
  scanSensitiveContent(content, name);
  return content;
};

const withDocumentChecksum = (document) => ({
  ...document,
  document_checksum: `sha256:${sha256(stableStringify(document))}`,
});

const validateDocumentChecksum = (document, name) => {
  const checksum = document.document_checksum;
  if (!/^sha256:[0-9a-f]{64}$/.test(checksum ?? "")) {
    fail("content-collision", `${name} has an invalid document checksum`);
  }
  const withoutChecksum = { ...document };
  delete withoutChecksum.document_checksum;
  const expected = `sha256:${sha256(stableStringify(withoutChecksum))}`;
  if (checksum !== expected) {
    fail("content-collision", `${name} content differs from its checksum`);
  }
};

const readCanonicalDocument = (filePath, recordsRoot) => {
  const relative = path.relative(recordsRoot, filePath).split(path.sep).join("/");
  assertNoSymlinkComponents(recordsRoot, relative);
  const stat = fs.lstatSync(filePath);
  if (stat.isSymbolicLink()) {
    fail("symlink-rejected", `canonical document is a symlink: ${filePath}`);
  }
  if (!stat.isFile()) {
    fail("content-collision", `canonical document is not a file: ${filePath}`);
  }
  const text = fs.readFileSync(filePath, "utf8");
  let document;
  try {
    document = JSON.parse(text);
  } catch {
    fail("content-collision", `${filePath} is not valid JSON`);
  }
  if (text !== prettyCanonicalJson(document)) {
    fail("content-collision", `${filePath} is not canonical JSON`);
  }
  validateDocumentPayload(document, filePath);
  return document;
};

const startSemanticPayload = (document) => ({
  schema_version: document.schema_version,
  project: document.project,
  task: document.task,
  step: document.step,
  session: document.session,
  input_artifacts: document.input_artifacts,
});

const finishSemanticPayload = (document) => ({
  schema_version: document.schema_version,
  run_id: document.run_id,
  output_artifacts: document.output_artifacts,
  receipt: document.receipt,
  result: document.result,
  observations: document.observations,
  next: document.next,
});

const validateTimestamp = (value, field) => {
  if (
    !isNonEmptyString(value) ||
    Number.isNaN(Date.parse(value)) ||
    new Date(value).toISOString() !== value
  ) {
    fail("content-collision", `${field} must be a canonical ISO timestamp`);
  }
};

const validateStoredStart = (
  startPath,
  runId,
  { semanticStart, runtime, recordsRoot } = {},
) => {
  const document = readCanonicalDocument(startPath, recordsRoot);
  rejectStoredUnknownKeys(
    document,
    [
      "schema_version",
      "project",
      "task",
      "step",
      "session",
      "input_artifacts",
      "run_id",
      "recorded_at",
      "runtime",
      "status",
      "document_checksum",
    ],
    "start.json",
  );
  validateDocumentChecksum(document, "start.json");
  const storedSemantic = startSemanticPayload(document);
  const computedRunId = `sha256:${sha256(stableStringify(storedSemantic))}`;
  if (document.run_id !== runId || computedRunId !== runId) {
    fail("content-collision", `${startPath} has a different run identity`);
  }
  if (document.status !== "pending") {
    fail("content-collision", `${startPath} must remain pending`);
  }
  validateTimestamp(document.recorded_at, "start.json.recorded_at");
  requireObject(document.runtime, "start.json.runtime");
  rejectStoredUnknownKeys(
    document.runtime,
    ["repo_root", "input_sources", "input_total_size"],
    "start.json.runtime",
  );
  requireString(document.runtime.repo_root, "start.json.runtime.repo_root");
  if (
    !Array.isArray(document.runtime.input_sources) ||
    !Number.isInteger(document.runtime.input_total_size) ||
    document.runtime.input_total_size < 0
  ) {
    fail("content-collision", "start.json runtime metadata is invalid");
  }
  if (
    semanticStart &&
    stableStringify(storedSemantic) !== stableStringify(semanticStart)
  ) {
    fail("content-collision", `${startPath} has different semantic content`);
  }
  if (
    runtime &&
    stableStringify({
      input_sources: document.runtime.input_sources,
      input_total_size: document.runtime.input_total_size,
    }) !==
      stableStringify({
        input_sources: runtime.input_sources,
        input_total_size: runtime.input_total_size,
      })
  ) {
    fail("content-collision", `${startPath} has different runtime content`);
  }
  return document;
};

const validateStoredRecord = (
  recordPath,
  runId,
  { semanticFinish, recordId, recordsRoot } = {},
) => {
  const document = readCanonicalDocument(recordPath, recordsRoot);
  rejectStoredUnknownKeys(
    document,
    [
      "schema_version",
      "run_id",
      "output_artifacts",
      "receipt",
      "result",
      "observations",
      "next",
      "record_id",
      "recorded_at",
      "status",
      "document_checksum",
    ],
    "record.json",
  );
  validateDocumentChecksum(document, "record.json");
  const storedSemantic = finishSemanticPayload(document);
  const computedRecordId = `sha256:${sha256(stableStringify(storedSemantic))}`;
  if (
    document.run_id !== runId ||
    document.record_id !== computedRecordId ||
    (recordId && document.record_id !== recordId)
  ) {
    fail("content-collision", `${recordPath} has a different record identity`);
  }
  if (
    semanticFinish &&
    stableStringify(storedSemantic) !== stableStringify(semanticFinish)
  ) {
    fail("content-collision", `${recordPath} has different semantic content`);
  }
  if (document.status !== "complete") {
    fail("content-collision", `${recordPath} must be complete`);
  }
  validateTimestamp(document.recorded_at, "record.json.recorded_at");
  return document;
};

const sourceForRecheck = (source) => ({
  kind: source.kind,
  source_type: source.source_type,
  locator:
    source.source_type === "inline" ? "<inline-not-rechecked>" : source.locator,
});

const validateStart = (input) => {
  requireObject(input, "start input");
  rejectUnknownKeys(
    input,
    [
      "schema_version",
      "records_root",
      "project",
      "task",
      "step",
      "session",
      "input_sources",
    ],
    "start input",
  );
  if (input.schema_version !== 1) {
    fail("invalid-input", "schema_version must be 1");
  }
  const project = requireObject(input.project, "project");
  const task = requireObject(input.task, "task");
  const step = requireObject(input.step, "step");
  const session = requireObject(input.session, "session");
  rejectUnknownKeys(project, ["id", "repo_root"], "project");
  rejectUnknownKeys(task, ["roadmap_path", "task_number"], "task");
  rejectUnknownKeys(
    step,
    ["skill", "session_type", "attempt"],
    "step",
  );
  rejectUnknownKeys(session, ["surface", "model"], "session");
  const skill = requireString(step.skill, "step.skill");
  if (!WORKFLOW_SKILLS.includes(skill)) {
    fail("invalid-input", `unsupported workflow skill: ${skill}`);
  }
  if (!SESSION_TYPES.has(step.session_type)) {
    fail("invalid-input", "step.session_type is invalid");
  }
  if (SKILL_SESSION_TYPE[skill] !== step.session_type) {
    fail(
      "invalid-input",
      `${skill} requires session_type ${SKILL_SESSION_TYPE[skill]}`,
    );
  }
  if (!Number.isInteger(step.attempt) || step.attempt < 1) {
    fail("invalid-input", "step.attempt must be a positive integer");
  }
  ensureRequirements(
    skill,
    input.input_sources,
    START_REQUIREMENTS,
    "input_sources",
  );
  return {
    project_id: validateSafeSegment(project.id, "project.id"),
    repo_root: requireString(project.repo_root, "project.repo_root"),
    roadmap_path: validateRepoRelativePath(
      task.roadmap_path,
      "task.roadmap_path",
    ),
    task_number: validateSafeSegment(task.task_number, "task.task_number"),
    skill,
    session_type: step.session_type,
    attempt: step.attempt,
    surface: requireString(session.surface, "session.surface"),
    model: requireString(session.model, "session.model"),
  };
};

export function startWorkflowStep(input, options = {}) {
  const runner = options.commandRunner ?? defaultCommandRunner;
  const validated = validateStart(input);
  if (validated.skill === "task-groundwork") {
    const roadmapSource = input.input_sources.find(
      ({ kind }) => kind === "roadmap-task",
    );
    const sourcePath = validateRepoRelativePath(
      roadmapSource.locator,
      "roadmap-task.locator",
    );
    if (sourcePath !== validated.roadmap_path) {
      fail(
        "invalid-input",
        "roadmap-task locator must match task.roadmap_path",
      );
    }
  }
  const recordsRootResolution = resolveRecordsRoot(
    input.records_root,
    options,
  );
  const recordsRoot = recordsRootResolution.root;
  const repoRoot = resolveProjectRoot(validated.repo_root, runner);
  const captured = captureArtifacts(input.input_sources, repoRoot, runner);
  if (captured.totalSize > LIMITS.max_run_bytes) {
    fail("snapshot-too-large", "start snapshot exceeds run byte limit");
  }

  const semanticStart = {
    schema_version: 1,
    project: { id: validated.project_id },
    task: {
      roadmap_path: validated.roadmap_path,
      task_number: validated.task_number,
    },
    step: {
      skill: validated.skill,
      session_type: validated.session_type,
      attempt: validated.attempt,
    },
    session: { surface: validated.surface, model: validated.model },
    input_artifacts: captured.artifacts.map(({ descriptor }) => descriptor),
  };
  const runId = `sha256:${sha256(stableStringify(semanticStart))}`;
  const taskRoot = path.join(
    recordsRoot,
    "projects",
    validated.project_id,
    "tasks",
    validated.task_number,
  );
  const runsRoot = path.join(taskRoot, "runs");
  const runtime = {
    repo_root: repoRoot,
    input_sources: input.input_sources
      .map(sourceForRecheck)
      .sort((left, right) =>
        byteOrder(stableStringify(left), stableStringify(right)),
      ),
    input_total_size: captured.totalSize,
  };
  const recordedAt = (options.now ?? (() => new Date().toISOString()))();
  validateTimestamp(recordedAt, "start.json.recorded_at");
  const startDocument = withDocumentChecksum({
    ...semanticStart,
    run_id: runId,
    recorded_at: recordedAt,
    runtime,
    status: "pending",
  });
  validateDocumentPayload(startDocument, "start.json");
  reserveAttempt(
    recordsRoot,
    taskRoot,
    validated.skill,
    validated.attempt,
    runId,
  );

  const runDirectory = path.join(
    runsRoot,
    runId.slice("sha256:".length),
  );
  const startPath = path.join(runDirectory, "start.json");
  if (fs.existsSync(startPath)) {
    validateStoredStart(startPath, runId, {
      semanticStart,
      runtime,
      recordsRoot,
    });
    for (const artifact of captured.artifacts) {
      publishArtifact(recordsRoot, artifact);
    }
    const recordPath = path.join(runDirectory, "record.json");
    if (fs.existsSync(recordPath)) {
      const existingRecord = validateStoredRecord(recordPath, runId, {
        recordsRoot,
      });
      for (const descriptor of existingRecord.output_artifacts) {
        verifyStoredArtifact(recordsRoot, descriptor);
      }
    }
    return {
      run_id: runId,
      start_path: startPath,
      status: fs.existsSync(recordPath) ? "complete" : "pending",
      records_root: recordsRoot,
      records_root_source: recordsRootResolution.source,
      sync_required: recordsRootResolution.syncRequired,
    };
  }
  for (const artifact of captured.artifacts) {
    publishArtifact(recordsRoot, artifact);
  }
  try {
    publishJsonExclusive(recordsRoot, startPath, startDocument);
  } catch (error) {
    if (!fs.existsSync(startPath)) throw error;
    validateStoredStart(startPath, runId, {
      semanticStart,
      runtime,
      recordsRoot,
    });
  }
  return {
    run_id: runId,
    start_path: startPath,
    status: "pending",
    records_root: recordsRoot,
    records_root_source: recordsRootResolution.source,
    sync_required: recordsRootResolution.syncRequired,
  };
}

const recaptureReadOnlyInputs = (startDocument, runner) => {
  const recapturable = startDocument.runtime.input_sources.filter(
    (source) => source.source_type !== "inline",
  );
  const current = captureArtifacts(
    recapturable,
    startDocument.runtime.repo_root,
    runner,
  ).artifacts.map(({ descriptor }) => descriptor);
  const expected = startDocument.input_artifacts.filter(
    (artifact) => artifact.source_type !== "inline",
  );
  if (stableStringify(current) !== stableStringify(expected)) {
    fail(
      "input-mutated-during-run",
      `${startDocument.step.skill} input changed after start`,
    );
  }
};

export function finishWorkflowStep(runId, input, options = {}) {
  requireObject(input, "finish input");
  rejectUnknownKeys(
    input,
    ["records_root", "output_sources", "receipt", "observations", "next"],
    "finish input",
  );
  const runner = options.commandRunner ?? defaultCommandRunner;
  const recordsRootResolution = resolveRecordsRoot(
    input.records_root,
    options,
  );
  const recordsRoot = recordsRootResolution.root;
  const runDirectory = findRunDirectory(recordsRoot, runId);
  const startPath = path.join(runDirectory, "start.json");
  const startDocument = validateStoredStart(startPath, runId, { recordsRoot });
  for (const descriptor of startDocument.input_artifacts) {
    verifyStoredArtifact(recordsRoot, descriptor);
  }
  const skill = startDocument.step.skill;
  const normalizedReceipt = normalizeReceiptForFinish(skill, input.receipt);
  const { result } = normalizedReceipt;
  ensureRequirements(
    skill,
    input.output_sources,
    FINISH_REQUIREMENTS,
    "output_sources",
    { blocked: result === "blocked" },
  );
  if (READ_ONLY_INPUT_SKILLS.has(skill)) {
    recaptureReadOnlyInputs(startDocument, runner);
  }
  const captured = captureArtifacts(
    input.output_sources,
    startDocument.runtime.repo_root,
    runner,
  );
  if (
    startDocument.runtime.input_total_size + captured.totalSize >
    LIMITS.max_run_bytes
  ) {
    fail("snapshot-too-large", "input and output exceed run byte limit");
  }
  const observations = validateObservations(input.observations);
  const next = validateNext(input.next);
  const semanticFinish = {
    schema_version: 1,
    run_id: runId,
    output_artifacts: captured.artifacts.map(({ descriptor }) => descriptor),
    receipt: normalizedReceipt.receipt,
    result,
    observations,
    next,
  };
  const recordId = `sha256:${sha256(stableStringify(semanticFinish))}`;
  const recordedAt = (options.now ?? (() => new Date().toISOString()))();
  validateTimestamp(recordedAt, "record.json.recorded_at");
  const recordDocument = withDocumentChecksum({
    ...semanticFinish,
    record_id: recordId,
    recorded_at: recordedAt,
    status: "complete",
  });
  validateDocumentPayload(recordDocument, "record.json");
  const recordPath = path.join(runDirectory, "record.json");
  if (fs.existsSync(recordPath)) {
    const existing = validateStoredRecord(recordPath, runId, {
      semanticFinish,
      recordId,
      recordsRoot,
    });
    for (const artifact of captured.artifacts) {
      publishArtifact(recordsRoot, artifact);
    }
    return {
      run_id: runId,
      record_id: recordId,
      record_path: recordPath,
      result: existing.result,
      status: "complete",
      records_root: recordsRoot,
      records_root_source: recordsRootResolution.source,
      sync_required: recordsRootResolution.syncRequired,
    };
  }
  for (const artifact of captured.artifacts) {
    publishArtifact(recordsRoot, artifact);
  }
  try {
    publishJsonExclusive(recordsRoot, recordPath, recordDocument);
  } catch (error) {
    if (!fs.existsSync(recordPath)) throw error;
    validateStoredRecord(recordPath, runId, {
      semanticFinish,
      recordId,
      recordsRoot,
    });
  }
  return {
    run_id: runId,
    record_id: recordId,
    record_path: recordPath,
    result,
    status: "complete",
    records_root: recordsRoot,
    records_root_source: recordsRootResolution.source,
    sync_required: recordsRootResolution.syncRequired,
  };
}

export function getWorkflowStepStatus(runId, options = {}) {
  const runner = options.commandRunner ?? defaultCommandRunner;
  const recordsRoot = resolveRecordsRoot(
    options.records_root,
    options,
  ).root;
  const runDirectory = findRunDirectory(recordsRoot, runId);
  const startPath = path.join(runDirectory, "start.json");
  const recordPath = path.join(runDirectory, "record.json");
  const startDocument = validateStoredStart(startPath, runId, { recordsRoot });
  for (const descriptor of startDocument.input_artifacts) {
    verifyStoredArtifact(recordsRoot, descriptor);
  }
  if (fs.existsSync(recordPath)) {
    const recordDocument = validateStoredRecord(recordPath, runId, {
      recordsRoot,
    });
    for (const descriptor of recordDocument.output_artifacts) {
      verifyStoredArtifact(recordsRoot, descriptor);
    }
  }
  return {
    start_path: startPath,
    ...(fs.existsSync(recordPath) ? { record_path: recordPath } : {}),
    status: fs.existsSync(recordPath) ? "complete" : "pending",
  };
}
