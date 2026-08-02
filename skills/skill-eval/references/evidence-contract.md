# Evidence contract

The verifier accepts one JSON result for one exact adapter and model:

```yaml
schema_version: 2
subject:
  name: example
  path: skills/example
  content_sha256: <current package hash>
baseline:
  mode: old_skill | without_skill
  content_sha256: <old package hash when old_skill>
surface:
  adapter: codex | claude-code | cursor | opencode | cline
  model: <exact model name>
cases:
  total: 3
  results:
    - id: primary
      assertions:
        - text: <observable check>
          passed: true
          evidence: {path: checks/primary.txt, sha256: <hash>}
      grade:
        baseline_score: 3
        subject_score: 4
        evidence: {path: grades/primary.txt, sha256: <hash>}
trigger:
  required: true
  verdict: PASS | FAIL | NOT_RUN
comparison:
  regressions: 0
  discriminating_lift: true
  baseline:
    duration_ms: 1000
    usage: {status: observed, input: 10, cached_input: 0, output: 5, reasoning_output: 0, total: 15}
  subject:
    duration_ms: 900
    usage: {status: unavailable}
evidence:
  workspace: .skill-eval-runs/R1
  runs:
    - case_id: primary
      configuration: baseline
      run_id: R1-primary-baseline
      telemetry: {path: primary/baseline/trace/telemetry.json, sha256: <hash>}
    - case_id: primary
      configuration: subject
      run_id: R1-primary-subject
      telemetry: {path: primary/subject/trace/telemetry.json, sha256: <hash>}
```

Repeat `evidence.runs` for every canonical case pair. Case IDs, prompts, and
assertion texts must match the current `evals/evals.json`. Run IDs and telemetry
paths must be unique. Every referenced file must live under the evidence
workspace and match its SHA-256 hash.

Assertion evidence is JSON bound to the subject output:

```json
{"passed":true,"subject_output_sha256":"<hash>","details":"validator output"}
```

Grade evidence is JSON bound to both paired outputs:

```json
{"baseline_score":3,"subject_score":4,"baseline_output_sha256":"<hash>","subject_output_sha256":"<hash>","details":"blind comparison"}
```

Run:

```sh
node skills/skill-eval/scripts/compute-eval-verdict.mjs result.json \
  --subject-path skills/example \
  --baseline-path .skill-eval-runs/baselines/<hash>
```

Omit `--baseline-path` for `without_skill`. An old baseline must be the same
skill in a snapshot directory named by its package hash. The verifier rehashes
the current subject and old baseline before and after evidence validation,
reparses raw harness output, checks canonical cases, paired prompt/fixture/
harness/permission equality, checks artifact-bound assertion and grade JSON,
recomputes usage aggregates, and derives the terminal verdict.

Hashes here prevent accidental stale or changed evidence. They are not keys,
signatures, or proof that a particular person approved the result. Human
acceptance and commit remain separate decisions.
