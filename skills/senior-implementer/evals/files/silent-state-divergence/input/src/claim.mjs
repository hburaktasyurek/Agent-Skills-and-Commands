import { readFile } from "node:fs/promises";

export async function claim(storePath, jobId) {
  const state = JSON.parse(await readFile(storePath, "utf8"));
  const job = state.jobs[jobId];

  if (!job) {
    throw new Error(`Unknown job: ${jobId}`);
  }

  if (job.status !== "pending") {
    return { claimed: false, status: job.status };
  }

  job.status = "running";

  return { claimed: true, status: "running" };
}
