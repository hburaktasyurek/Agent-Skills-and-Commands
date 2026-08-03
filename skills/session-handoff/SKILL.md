---
name: session-handoff
description: Use only when the user explicitly names session-handoff or explicitly asks to create a durable resume packet for a later agent session. Capture the exact live state, unresolved work, decisions, constraints, and next action needed to continue without re-deriving context; do not create a packet when there is no actionable state to transfer.
---

# Session Handoff

Create one compact, factual resume artifact for a fresh session. Optimize for
correct continuation, not for recording everything that happened.

## Evidence first

1. Identify the project the user intends to resume. If it is a repository,
   inspect live branch, HEAD, `git status --short --branch`, and the relevant
   changed paths. Do not infer completion from a clean tree or from an agent's
   prose.
2. Read the authoritative task artifacts and the current conversation context.
   Separate:
   - verified state from commands or files;
   - explicit user decisions and constraints;
   - work reported but not independently verified;
   - unresolved questions, failures, and same-root residuals.
3. Record test evidence only when the exact command and result are available.
   A focused green test is not a green full suite. Planned, started, or claimed
   work is not completed work.
4. Include conversation-only facts only when the next session cannot recover
   them cheaply from repository files or history. Omit completed detours,
   narration, and background that does not change the next action.

Git dirtiness can prove a code phase, but a clean tree cannot prove a design
phase. Determine design, code, or mixed state from both the task context and
live artifacts.

## Actionable-state gate

If there is no active goal, decision, blocker, pending work, or non-recoverable
context, do not create `.handoff/` or a handoff file. Say that there is no
actionable state to transfer and ask the user to invoke the skill in the
original session if context was lost.

## Write the packet

When actionable state exists, create exactly one file at
`.handoff/YYYY-MM-DD-HHMM-session.md` inside the intended project. Use only the
sections that carry real continuation value:

```markdown
# Resume

## Current state
- Goal: ...
- Working directory: ...
- Branch / HEAD: ...
- Worktree: ...

## Verified completed
- ...

## In progress and residuals
- ...

## Next action
- ...

## Decisions and constraints
- Selected: ... / Rejected: ... / Because: ...

## Verification
- `<exact command>` — PASS | FAIL | NOT RUN; scope: ...

## Relevant files
- `path` — why it matters
```

Rules:

- Omit empty sections. Never write `None` or `N/A`.
- For a pure design handoff, verify repository state but omit working
  directory, branch, HEAD, worktree, changed-file inventory, relevant-file
  lists, and facts that merely say the repository exists or no implementation
  has started. Include a code artifact or Git fact only when it directly
  constrains the next design decision.
- Use one exact next action when the path is known. List alternatives only when
  a real unresolved decision creates multiple valid branches; do not add a
  generic options menu or ask the user to choose again.
- Preserve explicit rationale. If a decision's reason is unavailable, write
  `rationale not captured — verify before relying on it`; never invent one.
- Mark unverified claims and incomplete evidence plainly.
- Keep file lists to paths that affect resumption. Do not dump the whole diff.
- Do not commit, push, modify product code, or change task state while creating
  the packet.

After writing, report the absolute handoff path and one sentence naming the
captured next action.
