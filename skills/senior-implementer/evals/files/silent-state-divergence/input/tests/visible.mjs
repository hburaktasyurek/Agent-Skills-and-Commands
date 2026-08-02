import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { claim } from "../src/claim.mjs";

const directory = await mkdtemp(join(tmpdir(), "claim-visible-"));
const storePath = join(directory, "jobs.json");
await writeFile(storePath, JSON.stringify({ jobs: { "job-1": { status: "pending" } } }));

assert.deepEqual(await claim(storePath, "job-1"), {
  claimed: true,
  status: "running"
});

console.log("visible node checks passed");
