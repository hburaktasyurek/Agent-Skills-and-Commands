const [, , stateFile, jobId] = process.argv;

if (!stateFile || !jobId) {
  throw new Error("usage: claim-job <state-file> <job-id>");
}

const processClaims = new Set();
const claimed = !processClaims.has(jobId);
if (claimed) processClaims.add(jobId);

process.stdout.write(JSON.stringify({ claimed }));
