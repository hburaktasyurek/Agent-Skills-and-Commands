---
name: commit-work
description: >-
  Stage intended changes, split into logical commits, and write Conventional Commit messages.
  Spawns a Haiku or Sonnet agent based on diff size so the main model (even Opus) is never used for commits.
  Use when asked to commit, craft a commit message, stage changes, or split work into multiple commits.
---

# Commit Work

Commits should be easy to review and safe to ship: only intended changes included, logically scoped, messages explain what and why.

## Step 1 — Read project context

Read `CLAUDE.md` (or `.claude/CLAUDE.md`) if it exists. Extract:
- Commit message language (Turkish or English)
- Any project-specific commit rules (scopes, max length, Co-Authored-By policy, etc.)

If no CLAUDE.md exists, default to English.

## Step 2 — Measure the diff

Run these read-only commands to assess the working tree:

```bash
git status
git diff --stat
git diff --cached --stat
```

Count the total lines changed (added + removed). If nothing is staged and nothing is modified, stop and tell the user there is nothing to commit.

Do not narrate the result of Step 2 to the user. Measure silently, pick the model, spawn — no text between the diff check and the agent spawn.

## Step 3 — Choose the agent model

- Total diff lines ≤ 300 → use **haiku**
- Total diff lines > 300 → use **sonnet**

## Step 4 — Spawn the commit agent

Spawn an Agent with the chosen model and this brief:

> You are a commit agent. Your only job is to create clean, well-scoped git commits.
>
> **Rules:**
> - Write commit messages in the language specified by CLAUDE.md (Turkish or English). If not specified, use English.
> - Use Conventional Commits: `type(scope): subject` (max 72 chars)
> - Body explains WHY, not what (the diff shows what)
> - No `Co-Authored-By` lines
> - No AI attribution of any kind
> - No secrets, debug logs, or unrelated formatting churn
>
> **Workflow:**
> 1. Run `git status`, `git diff` (unstaged), `git diff --cached` (staged)
> 2. Decide commit boundaries — split by: feature vs refactor, backend vs frontend, tests vs prod code, dependency bumps vs behavior changes
> 3. For mixed files use patch staging: `git add -p`
> 4. Run `git diff --cached` to verify what will be committed
> 5. Write the commit message — describe staged change in 1–2 sentences first (what + why); if you can't, the commit is too big, go back to step 2
> 6. Commit with: `git commit -m "$(cat <<'EOF'`  then the message then `EOF` then `)"` 
> 7. Verify with `git log --oneline -1`
> 8. Repeat until working tree is clean
>
> **Deliverable:** list each commit (hash + message + one-line why).

## Guardrails

- If the diff contains secrets or tokens, stop and warn the user — do not commit.
- If changes are unrelated, split into multiple commits.
- Never use `--no-verify`.
