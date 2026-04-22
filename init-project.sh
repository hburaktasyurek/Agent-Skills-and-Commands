#!/usr/bin/env bash
# init-project.sh — Initialize a project with shared agent-os standards
# Usage: ./init-project.sh [project-path]
#        ./init-project.sh /path/to/my-project
#
# Agents are global (installed via ./install.sh to ~/.claude/agents/), so this
# script only wires up per-project pieces: agent-os command symlinks, an empty
# agent-memory/ scaffold, and a .gitignore entry for that memory dir.

set -e
trap 'echo "✗ error on line $LINENO" >&2' ERR

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_PATH="${1:-.}"

if [ ! -d "$PROJECT_PATH" ]; then
  echo "Error: Directory '$PROJECT_PATH' does not exist"
  exit 1
fi

PROJECT_PATH="$(cd "$PROJECT_PATH" && pwd)"
PROJECT_NAME="$(basename "$PROJECT_PATH")"

echo "Initializing project: $PROJECT_NAME"
echo "Path: $PROJECT_PATH"
echo ""

# ── 1. Create .claude structure ──────────────────────────────────────────────
mkdir -p "$PROJECT_PATH/.claude/commands/agent-os"
mkdir -p "$PROJECT_PATH/.claude/agent-memory"

# ── 2. Symlink agent-os standard commands ────────────────────────────────────
echo "→ Linking agent-os standard commands (.claude/commands/agent-os/)"

shopt -s nullglob
standards_files=("$REPO_DIR/standards"/*.md)
shopt -u nullglob

if [ ${#standards_files[@]} -eq 0 ]; then
  echo "Error: no standards found in $REPO_DIR/standards/ — repo appears incomplete" >&2
  exit 1
fi

for cmd_file in "${standards_files[@]}"; do
  if [ ! -f "$cmd_file" ]; then
    echo "  ! skipping non-file entry: $cmd_file" >&2
    continue
  fi
  cmd_name=$(basename "$cmd_file")
  target="$PROJECT_PATH/.claude/commands/agent-os/$cmd_name"
  [ -L "$target" ] && rm "$target"
  ln -s "$cmd_file" "$target"
  echo "  ✓ $cmd_name"
done

# ── 3. Pre-create per-agent memory directories ───────────────────────────────
# Agents bootstrap by writing .claude/agent-memory/<name>/learned-context.md on
# first use; pre-creating the parent dir keeps that first write from failing.
echo ""
echo "→ Creating agent-memory/ subdirs for each global agent"
for agent_file in "$REPO_DIR/agents"/*.md; do
  [ -f "$agent_file" ] || continue
  agent_name=$(basename "$agent_file" .md)
  mkdir -p "$PROJECT_PATH/.claude/agent-memory/$agent_name"
  echo "  ✓ agent-memory/$agent_name/"
done

# ── 4. Warn about legacy project-local agent copies ──────────────────────────
# Project-level .claude/agents/<name>.md shadows the global ~/.claude/agents
# symlink for the same name. If the project was initialized by the old
# agent-templates flow, the copies are still there and would silently keep
# serving the old prompt. Warn but do not delete — migration is manual.
stale_found=0
for agent_file in "$REPO_DIR/agents"/*.md; do
  [ -f "$agent_file" ] || continue
  agent_filename=$(basename "$agent_file")
  legacy="$PROJECT_PATH/.claude/agents/$agent_filename"
  if [ -f "$legacy" ] && [ ! -L "$legacy" ]; then
    if [ "$stale_found" -eq 0 ]; then
      echo ""
      echo "⚠️  Legacy project-local agent copies found (shadow the global agents):"
      stale_found=1
    fi
    echo "     $legacy"
  fi
done
if [ "$stale_found" -eq 1 ]; then
  echo "   These override ~/.claude/agents/ — remove them after migrating any"
  echo "   relevant context into .claude/agent-memory/<name>/learned-context.md."
fi

# ── 5. Ensure .claude/.gitignore excludes agent-memory/ ──────────────────────
gitignore="$PROJECT_PATH/.claude/.gitignore"
if ! { [ -f "$gitignore" ] && grep -qxF "agent-memory/" "$gitignore"; }; then
  # Prepend a newline if the existing file is non-empty and doesn't end with one,
  # otherwise the appended entry concatenates onto the previous line.
  if [ -s "$gitignore" ] && [ "$(tail -c1 "$gitignore" | wc -l)" -eq 0 ]; then
    printf '\n' >> "$gitignore"
  fi
  printf 'agent-memory/\n' >> "$gitignore"
  echo "  ✓ .claude/.gitignore: added agent-memory/"
fi

# ── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo "✓ Project initialized: $PROJECT_NAME"
echo ""
echo "Next steps:"
echo "  1. Ensure global agents are installed (./install.sh from this repo)"
echo "  2. Create CLAUDE.md if it doesn't exist"
echo "  3. Run /plan-product to populate agent-os/product/ docs"
echo ""
echo "Agents bootstrap themselves on first use: they scan agent-os/, CLAUDE.md,"
echo "composer.json/package.json, ask for missing context, then write to"
echo ".claude/agent-memory/<agent>/learned-context.md for reuse."
