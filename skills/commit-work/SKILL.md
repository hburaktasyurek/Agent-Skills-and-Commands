---
name: commit-work
description: >-
  Stage intended changes, split into logical commits, and write Conventional Commit messages.
  Spawns a Sonnet agent so the main model is never used for commits.
  Use when asked to commit, craft a commit message, stage changes, or split work into multiple commits.
---

# Commit Work

Commits should be easy to review and safe to ship: only intended changes included, logically scoped, messages explain what and why.

## Step 1 — Check for changes

Run `git status`. If nothing is staged and nothing is modified, stop and tell the user there is nothing to commit.

## Step 2 — Spawn the commit agent

Spawn a **sonnet** Agent. Pass the brief below **verbatim** as the entire prompt — it is not a template to extend. The sub-agent has git; pre-context is speculation, git is fact.

> You are a commit agent. Your only job is to create clean, well-scoped git commits.
>
> **Rules:**
> - Read CLAUDE.md (or `.claude/CLAUDE.md`) if it exists — use it for commit message language (Turkish or English), project-specific scopes, subject limits, and trailer rules. Default to English if absent.
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
> 7. Repeat until working tree is clean
> 8. Run `git push` — if the branch has no upstream, run `git push -u origin HEAD` instead
>
> **Deliverable:** list each commit (hash + message + one-line why), then confirm push succeeded.

## Guardrails

- If the diff contains secrets or tokens, stop and warn the user — do not commit.
- Never use `--no-verify`.
- **Never add `Co-Authored-By` or any AI attribution** — not in the subject, body, or trailer. This is an explicit project policy; apply it even if the default commit template includes attribution.
