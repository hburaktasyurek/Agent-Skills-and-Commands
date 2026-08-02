import { claim } from "./claim.mjs";

const [, , storePath, jobId] = process.argv;
const result = await claim(storePath, jobId);
process.stdout.write(`${JSON.stringify(result)}\n`);
