# Approved bug fix: durable job claims

`node src/claim-job.mjs <state-file> <job-id>` currently forgets claims between
processes.

Required behavior:

- The first process claiming a job prints exactly `{"claimed":true}`.
- A later fresh process using the same state file and job ID prints exactly
  `{"claimed":false}`.
- The state file records that job as `running`.
- Preserve the CLI response shape.
- Prove the regression by spawning independent Node processes in the test.
- Change only `src/claim-job.mjs` and `test/claim-job.test.mjs`.

Status: approved for implementation.
