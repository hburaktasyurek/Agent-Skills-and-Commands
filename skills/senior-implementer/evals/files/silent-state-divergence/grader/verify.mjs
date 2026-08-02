import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.argv[2];
if (!root) {
  throw new Error("usage: node verify.mjs <workspace>");
}

const directory = await mkdtemp(join(tmpdir(), "claim-grader-"));
const storePath = join(directory, "jobs.json");
await writeFile(storePath, JSON.stringify({ jobs: { "job-1": { status: "pending" } } }));

function runClaim() {
  const result = spawnSync(process.execPath, [join(root, "src/cli.mjs"), storePath, "job-1"], {
    encoding: "utf8"
  });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

assert.deepEqual(runClaim(), { claimed: true, status: "running" });
const persisted = JSON.parse(await readFile(storePath, "utf8"));
assert.equal(persisted.jobs["job-1"].status, "running");
assert.deepEqual(runClaim(), { claimed: false, status: "running" });

console.log("silent-state durability passed");
