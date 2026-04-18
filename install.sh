#!/usr/bin/env bash
# install.sh — Set up agent skills and commands on a new machine
# Usage: ./install.sh

set -e

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Agent Skills and Commands — Installation"
echo "Repo: $REPO_DIR"
echo ""

# ── 1. Claude Code skills ────────────────────────────────────────────────────
echo "→ Claude Code skills (~/.claude/skills/)"
mkdir -p "$HOME/.claude/skills"

for skill_dir in "$REPO_DIR/skills"/*/; do
  [ -d "$skill_dir" ] || continue
  skill_name=$(basename "$skill_dir")
  target="$HOME/.claude/skills/$skill_name"
  [ -L "$target" ] && rm "$target"
  ln -s "$skill_dir" "$target"
  echo "  ✓ $skill_name"
done

# ── 2. Claude Code commands ──────────────────────────────────────────────────
echo ""
echo "→ Claude Code commands (~/.claude/commands/)"
mkdir -p "$HOME/.claude/commands"

for cmd_file in "$REPO_DIR/commands"/*.md; do
  [ -f "$cmd_file" ] || continue
  cmd_name=$(basename "$cmd_file")
  target="$HOME/.claude/commands/$cmd_name"
  [ -L "$target" ] && rm "$target"
  ln -s "$cmd_file" "$target"
  echo "  ✓ $cmd_name"
done

# ── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo "✓ Installation complete!"
echo ""
echo "Next steps:"
echo "  1. Configure ~/.claude/settings.json as you like (allow-list, MCP servers, etc.)"
echo "  2. Run ./init-project.sh <project-path> to set up a project"
echo "  3. Run ./update-agents.sh to check agent versions across projects"
