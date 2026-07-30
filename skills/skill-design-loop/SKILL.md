---
name: skill-design-loop
description: "Orchestrate repository skill intake, path selection, and proposal drafting in one task, then stop before review or ship. Explicit invocation only. Use with a free-form skill idea or partial or complete checklist when the repository-owned design loop should produce one typed draft_created, decompose, or blocked result."
disable-model-invocation: true
---

# skill-design-loop

## Objective

Take one explicitly supplied skill-design intent through repository preflight,
bounded intake, path selection, and at most one proposal draft in the same
task. Preserve sibling skill contracts and stop before purpose review,
composition review, or ship.

## Invocation

- `/skill-design-loop` in Cursor or Claude Code
- `$skill-design-loop` in Codex
- `skill-design-loop`

Explicit invocation is required. Do not activate this workflow from an
ordinary skill-design discussion that did not name it.

## Input

Accept either:

- A free-form skill idea
- A partial checklist
- A complete checklist

The normalized checklist contains:

```yaml
purpose: ...
audience: ...
when_to_use: ...
when_not: ...
success_signal: ...
boundaries: ...
context: ...
output_format: ...
skill_name: ...
skill_summary: ...
invocation: [] # optional
replace: none | proposal | shipped | both
```

Normalize an omitted `replace` to `none`. Never invent checklist values or
replacement authority.

## Repository source of truth

1. Resolve `repo_root` from the active task working directory with
   `git rev-parse --show-toplevel`.
2. Require `<repo_root>/WORKFLOW.md`, `<repo_root>/skills/INDEX.md`, and the
   repository sibling `SKILL.md` files needed by the current stage.
3. Read and execute sibling instructions only from `<repo_root>/skills/`.
   Never use globally installed Codex, Cursor, Claude, or `.agents` content as
   source or fallback.
4. Always require `skill-brief`, `skill-path-selector`,
   `methodology-selector`, and `skill-draft-ship`. Require `grill-me` only when
   intake gaps need questions. Require `methodology-skill-creator` only after a
   methodology verdict.
5. If repository discovery or a current-stage dependency fails, write nothing
   and return `blocked`.

The only draft target is
`<repo_root>/.skill-proposals/<skill_name>/`.

## Embedded subflow semantics

Read each required sibling `SKILL.md` completely before applying it.

- A child's normal “stop after deliverable” ends only that child subflow.
  Capture its output and resume the next parent stage.
- If a child requires human input, stay in the current stage, ask exactly one
  question, and resume from the answer.
- `blocked`, `decompose`, exhausted intake budget, or one completed draft ends
  the parent task.
- Never ask the human to invoke another skill manually.
- These return semantics apply only inside this orchestrator and do not change
  the sibling skill's standalone stop contract.

## State machine

Append a stage to `stage_trace` when entering it. The terminal stage therefore
appears even when that stage fails.

### 1. preflight

Resolve the repository and verify the always-required sibling packages. On
failure return `blocked` with `stopped_at: preflight`, the missing dependency
list, and no writes.

### 2. intake

Enter intake even when the supplied checklist looks complete.

- If every required field is present, validate and preserve it without asking
  a question.
- Otherwise apply repository `skill-brief`. It may use repository `grill-me`
  only for missing fields, one question at a time, with a default maximum of
  eight decision questions.
- Recompute checklist completeness after every answer.
- If required fields remain unknown when the budget ends, return `blocked`
  with `missing_fields` and any unresolved `open_questions`.

Replacement permission is valid only when the human names `skill_name` and
the target kind in the current task.

### 3. selection

Apply repository `skill-path-selector` to the completed checklist. Preserve
its rationale and any `methodology-selector` contract without changing their
meaning.

- `decompose`: return the smaller skill list; write nothing.
- `blocked`: return selector evidence; write nothing.
- `methodology` or `procedural`: continue.

Collision gates:

| Collision | Allowed checklist value |
|---|---|
| proposal | `proposal` or `both` |
| shipped | `shipped` or `both` |
| both | `both` |

An unauthorized collision returns `blocked` with the exact target paths.
Permission for a shipped collision only authorizes creating a replacement
proposal; it never changes the shipped package during this task.

### 4. draft

Require `methodology-skill-creator` now when the verdict is `methodology`.
Invoke repository `skill-draft-ship` in draft mode with the complete checklist
and unmodified selector result.

- Methodology routes directly through `methodology-skill-creator`; never use
  `loop-orchestrator`.
- Procedural routes through the procedural authoring rules in
  `skill-draft-ship`.
- Stop after one `draft_created` result. Do not run `skill-review`,
  `skill-composition`, revise, ship, install, commit, or push.

## Terminal results

Return exactly one variant.

### Draft created

```yaml
result: draft_created
stage_trace: [preflight, intake, selection, draft]
stopped_at: draft
checklist:
  purpose: ...
  audience: ...
  when_to_use: ...
  when_not: ...
  success_signal: ...
  boundaries: ...
  context: ...
  output_format: ...
  skill_name: ...
  skill_summary: ...
  invocation: []
  replace: none | proposal | shipped | both
path:
  verdict: methodology | procedural
  rationale: ...
  contract: ... # methodology only; omit for procedural
draft:
  path: <repo_root>/.skill-proposals/<skill_name>
  replaced_proposal: true | false
next:
  skill: skill-review
  draft_path: <repo_root>/.skill-proposals/<skill_name>
  checklist: <normalized checklist>
```

### Decompose

```yaml
result: decompose
stage_trace: [preflight, intake, selection]
stopped_at: selection
checklist: <normalized checklist>
path:
  verdict: decompose
  rationale: ...
  smaller_skills:
    - skill_name: ...
      purpose: ...
      boundary: ...
next:
  skill: none
  owner: human
  action: approve_or_refine_decomposition
```

### Blocked

```yaml
result: blocked
stage_trace: [<every entered stage in order>]
stopped_at: preflight | intake | selection | draft
checklist: <normalized checklist or null>
path: <selector result or null>
blocked:
  code: repo_root_missing | missing_dependency | missing_fields | collision | selection_blocked | draft_validation_failed
  missing_fields: []
  missing_dependencies: []
  collision: # null when not applicable
    kind: proposal | shipped | both
    paths: []
  open_questions: []
  required_action: ...
next:
  skill: none
  owner: human
  action: ...
```

Use `null` only for `checklist`, `path`, or `collision` where the schema
explicitly permits it. Omit fields that belong only to a different terminal
variant.

## Validation

Run:

```bash
node skills/skill-design-loop/scripts/self-test.mjs
```

The self-test validates fixture coverage, route and collision expectations,
stage traces, output variants, explicit-only metadata, repository-only source
rules, and the pending or completed runtime-results schema.

## Boundaries

- Do not use global sibling packages as source or fallback.
- Do not write outside the current repository.
- Do not write a proposal on `blocked` or `decompose`.
- Do not replace any target without exact current-task human authority.
- Do not absorb sibling judgment or copy their contracts into an alternative
  implementation.
- Do not review, revise, compose, ship, install, commit, or push.

## Human review and stop

Human approval is required before proposal replacement, replacement intent for
a shipped name, composition skip, or ship. This skill owns only the first two.

Stop after one `draft_created`, `decompose`, or `blocked` result.
