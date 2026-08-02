# Run protocol

Use one adapter and one model per result. A second harness or model is a second
result, not another row in the same comparison.

## Matrix

For each case:

1. Copy the fixture into two disposable workspaces.
2. Baseline: expose the exact old skill, or no skill for `without_skill`.
3. Subject: expose the current subject package.
4. Run the exact same prompt and permission level in both workspaces.
5. Keep each trace outside its executor workspace so the run cannot read its
   own grading evidence or the paired output.

Example:

```sh
node skills/skill-eval/scripts/run-harness-eval.mjs \
  --adapter claude-code \
  --subject-path .skill-proposals/example \
  --skill-path .skill-proposals/example \
  --workspace .skill-proposals/.eval-runs/R1/1/subject/workspace \
  --trace-dir .skill-proposals/.eval-runs/R1/1/subject/trace \
  --prompt-file .skill-proposals/.eval-runs/R1/1/subject/workspace/prompt.txt \
  --case-id 1 \
  --run-id R1-1-subject \
  --configuration subject \
  --model claude-sonnet-5 \
  --permission workspace-write
```

Available adapters:

```sh
node skills/skill-eval/scripts/run-harness-eval.mjs --list-adapters
```

Codex, Claude Code, OpenCode, and Cline have native project-skill projections;
Cursor uses explicit prompt context. These are runner adapters, not a claim
that every installed CLI/version has passed a live conformance test. A real run
that does not match its parser or permission contract stays `INCONCLUSIVE`.
The runner also stops when a common global/project skill directory already
contains the same skill name, because that would contaminate the baseline.

This MVP permits `workspace-write` through the Codex and Cursor sandboxed
adapters. Claude Code, OpenCode, and Cline adapters are read-only because the
runner cannot yet guarantee that their authenticated shell/network surface is
isolated from consequential systems. A mutating case on those adapters stops
before execution; run it later inside a separately proven container/VM adapter.

## Grading

Assertions must describe observable output. Store each check result in a small
file and hash it. For subjective quality, hide which artifact is baseline and
which is subject before scoring them on the same scale.

Do not put expected answers, assertions, suspected defects, or the paired
artifact into executor prompts.

If a mutating or external task cannot be made disposable and harmless, do not
run it. Record the missing boundary and return `INCONCLUSIVE`.
