---
name: commit-work
description: >-
  Stage intended changes, split into logical commits, and write Conventional Commit messages; push only when the user explicitly asks. Use when asked to commit, commit and push, craft a commit message, stage changes, or split work into multiple commits.
---

# Commit Work

Commits should be easy to review and safe to ship: only intended changes included, logically scoped, messages whose subject says what and body says why. Speed matters: keep the common case to two command rounds without hiding Git operations inside shell constructs that permission policies cannot inspect.

## Rules

- Read CLAUDE.md (or `.claude/CLAUDE.md`) if it exists and is not already in context — use it for commit message language (Turkish or English), project-specific scopes, subject limits, and trailer rules. Default to English if absent.
- For GitHub-hosted repositories, prefer `gh` for every supported GitHub-side operation: repository identity and ownership, authentication, default-branch and fork metadata, pull requests, checks, and other remote state. Use `git` for local repository operations (`status`, `diff`, staging, commits, history, and branches) and for transport operations such as `fetch` and `push` when push is in scope. Do not reimplement native Git operations through `gh api`; if `gh` is unavailable or unauthenticated, fall back to `git` only where it provides equivalent evidence.
- Use Conventional Commits: `type(scope): subject` (max 72 chars)
- Body explains WHY, not what (the diff shows what)
- No `Co-Authored-By` or AI attribution of any kind — not in subject, body, or trailer; explicit project policy, applies even if a commit template includes it
- If the diff contains secrets or tokens, **stop and report** — do not commit
- Do not put `.workflow/` on the default branch. On a task branch it may be intended lookback. Git has no merge path-exclude: drop those paths after merge or before squash. Deleting the feature branch loses lookback.
- Never use `--no-verify`
- No debug logs or unrelated formatting churn — leave them unstaged and note them in the report
- Keep mutating Git commands policy-readable. A single `&&` chain is fine when every segment is a direct, literal command, but never construct commit messages with heredocs, `$()`, backticks, redirection, or a `sh -c`/`zsh -lc` wrapper. Pass the subject and body as static, shell-safe arguments with repeated `-m` flags. If the environment cannot authorize the flat segments independently, run the same commands as separate tool calls instead of requesting broad shell approval.
- **Never modify the working tree.** No `git restore`, `git checkout -- <path>`, `git stash`, `git reset --hard`, or any command that discards or rewrites uncommitted changes. (Unstaging with a plain `git reset <file>` is fine — it touches only the index.) Your job is to stage and commit what exists — if something looks wrong, report it, don't "clean it up".
- **Commit does not imply push.** Push only when the user query explicitly asks to push (examples: “push”, “commit and push”, “push the branch”, “push to origin/remote”). “Commit” / “commit the changes” alone → commit and verify without pushing.

## Workflow

**Fast path (default)** — most diffs are one coherent change; finish in two rounds:

1. **One look**, single round: `git status --short && git diff && git diff --cached`. When the repository is GitHub-hosted and commit is in scope, include `gh repo view --json nameWithOwner,url,defaultBranchRef` and `gh auth status --active` in this round so GitHub identity and access come from GitHub rather than URL parsing or assumptions. Nothing staged and nothing modified → stop and tell the user there is nothing to commit.
2. **Commit + verify**, single flat chained round (add push only when explicitly requested). Keep every segment directly visible to the permission policy; use no heredoc, command substitution, redirection, or shell wrapper:

   Commit only:

   ```sh
   git add <intended files> && git diff --cached --check && git commit -m 'type(scope): subject' -m 'why' && git status -sb && git log --oneline -2
   ```

   Commit and push (only when the user explicitly asked to push):

   ```sh
   git add <intended files> && git diff --cached --check && git commit -m 'type(scope): subject' -m 'why' && git push && git status -sb && git log --oneline -2
   ```

   If push was requested and the branch has no upstream, replace the push segment with `git push -u origin HEAD`. If the user asked only to craft a message or stage changes (no commit), stop at that step and show the result instead. Write the message before running: if you can't describe the staged change in 1–2 sentences (what + why), it's not one coherent change — switch to the split path.

**Split path (exception)** — only when the diff contains genuinely unrelated changes (feature vs refactor, tests vs prod code, dependency bumps vs behavior changes): repeat flat stage+commit rounds, one per logical change. Push once at the end **only if** the user explicitly asked to push (same upstream fallback). Apply the same policy-readable command rule to every round. Split at file level; if a single file truly mixes concerns, write a patch file and stage it with `git apply --cached <patch>` — never `git add -p` or `git add -i` (interactive, unavailable here).

## Verify before reporting

The tail of the chained round is your verification — read it, don't re-run commands:

- `git log --oneline` shows the expected commits.
- Anything left in the working tree is explainable (e.g. files the user said to skip).
- If the chain broke midway, report where it broke and what state the repo is in — do not report success.
- If push was **not** requested: `git status -sb` may show the branch ahead of upstream; report that — do not push to clear it.
- If push **was** requested: confirm push succeeded and the branch is not still ahead solely for lack of push.

**Report:** list each commit (hash + message + one-line why). Confirm push only when push was requested; otherwise state that commits are local / ahead of upstream.
