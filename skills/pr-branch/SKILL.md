---
name: pr-branch
description: >-
  Analyze commits on the current branch vs main, write a two-block PR description
  (non-technical summary for managers up top, technical detail for developers below),
  and open a GitHub PR. Use when asked to open a PR, create a pull request, or write a PR description.
---

# PR Branch

Two-block PR description: non-technical summary first (managers and stakeholders read this), technical detail second (developers and QA).

## Step 1 — Read project context

Read `CLAUDE.md` (or `.claude/CLAUDE.md`) if it exists. Extract:
- PR description language (Turkish or English)
- Any project-specific PR rules

If no CLAUDE.md or no language rule, default to English.

## Step 2 — Gather branch data

```bash
git branch --show-current
git log main..HEAD --oneline
git diff main...HEAD --stat
git diff main...HEAD
```

If `main..HEAD` is empty (no commits ahead of main), stop and tell the user there is nothing to PR.

## Step 3 — Spawn the PR agent

Spawn an Agent with model **sonnet** and this brief:

> You are a PR description writer. Your job: produce a structured GitHub PR description and open the PR immediately — no approval needed, return the URL.
>
> **Input you have:**
> - Branch name
> - Commit list (oneline)
> - Diff stat + full diff
> - Language (from CLAUDE.md or English default)
> - Project context (from CLAUDE.md)
>
> **Global rules:**
> - Write in the language specified
> - No AI attribution, no Co-Authored-By
> - **Visibility rule (critical):** Engineers often do large invisible work — rewriting systems, auditing entire layers, hardening security — that produces a small-looking diff. The PR description is the engineer's one chance to make that work visible to managers and stakeholders. Do NOT undersell. If 500 endpoints were audited, say so. If the entire payment system was rewritten, say so. Quantify whenever possible.
>
> ---
>
> **PR TITLE format:** `[Scope]: [Action] — [optional detail]`
> Examples: `Phase 2: Test Scope Discovery — complete audit + blueprints`, `Payment Refactor: gateway layer rewrite — Stripe, PayPal, Authorize.Net`
> Use the name from the roadmap or conversation context if available.
>
> ---
>
> **NON-TECHNICAL BLOCK** (managers and product stakeholders read this — top of description):
>
> Rules for this block:
> - No framework or library names. Plain language only. ("Laravel" → "payment system", "PHPUnit" → "automated test", "WordPress hook" → "system event")
> - Write as if the reader has never seen the codebase
>
> ## What This PR Does
>
> ### The Problem
> 1-2 sentence paragraph: what was missing, what was at risk, why this work was necessary.
> Always write a Problem framing — even for refactors or audits. ("We were about to X without knowing Y" works for audit PRs.)
>
> ### The Solution
> 1-2 sentence opening, then a bullet list of what was done — as a unified story, not a commit list.
> Make invisible work visible: scope, scale, and impact. Quantify.
>
> ## What Changes for the Team
> - **For product/non-technical reviewers:** what's fixed, what's safer, what's new — no jargon
> - **For developers:** what the code now guarantees, what patterns changed, what downstream work is unblocked
>
> ---
>
> **TECHNICAL BLOCK** (developers and QA read this — bottom of description):
>
> Rules for this block:
> - Use exact technical names: framework names, function names, file paths, class names
> - Precision over accessibility
>
> ## Technical Summary
> Table with: commits, files changed, lines written, and any key decisions documented
>
> ## Test Plan
> Checkbox list of concrete validation steps. For documentation-only PRs: structural checks. For production code changes: test run command + smoke check at minimum.
>
> ---
>
> **Workflow:**
> 1. Read all context
> 2. Write the PR description following the structure above
> 3. Confirm base branch is `main` (or the repo default)
> 4. Run `gh pr create --title "<title>" --body "$(cat <<'EOF'`  then description then `EOF` then `)"`
> 5. Return the PR URL

## Guardrails

- Never create the PR against a branch other than main without explicit user instruction.
- Never use `--force` or `git push --force`.
