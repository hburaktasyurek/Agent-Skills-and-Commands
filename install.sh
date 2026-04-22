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

# Remove stale skill symlinks (skills that no longer exist in repo)
for existing in "$HOME/.claude/skills"/*/; do
  [ -L "${existing%/}" ] || continue
  skill_name=$(basename "${existing%/}")
  [ -d "$REPO_DIR/skills/$skill_name" ] || { rm "${existing%/}"; echo "  ✗ removed stale: $skill_name"; }
done

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

# Remove stale command symlinks (commands that no longer exist in repo)
for existing in "$HOME/.claude/commands"/*.md; do
  [ -L "$existing" ] || continue
  cmd_name=$(basename "$existing")
  [ -f "$REPO_DIR/commands/$cmd_name" ] || { rm "$existing"; echo "  ✗ removed stale: $cmd_name"; }
done

for cmd_file in "$REPO_DIR/commands"/*.md; do
  [ -f "$cmd_file" ] || continue
  cmd_name=$(basename "$cmd_file")
  target="$HOME/.claude/commands/$cmd_name"
  [ -L "$target" ] && rm "$target"
  ln -s "$cmd_file" "$target"
  echo "  ✓ $cmd_name"
done

# ── 3. Claude Code global subagents ──────────────────────────────────────────
echo ""
echo "→ Claude Code global subagents (~/.claude/agents/)"
mkdir -p "$HOME/.claude/agents"

# Remove stale subagent symlinks (subagents that no longer exist in repo)
for existing in "$HOME/.claude/agents"/*.md; do
  [ -L "$existing" ] || continue
  agent_name=$(basename "$existing")
  [ -f "$REPO_DIR/agents/$agent_name" ] || { rm "$existing"; echo "  ✗ removed stale: $agent_name"; }
done

for agent_file in "$REPO_DIR/agents"/*.md; do
  [ -f "$agent_file" ] || continue
  agent_name=$(basename "$agent_file")
  target="$HOME/.claude/agents/$agent_name"
  [ -L "$target" ] && rm "$target"
  ln -s "$agent_file" "$target"
  echo "  ✓ $agent_name"
done

# ── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo "✓ Installation complete!"
echo ""
echo "Next steps:"
echo "  1. Configure ~/.claude/settings.json as you like (allow-list, MCP servers, etc.)"
echo "  2. Run ./init-project.sh <project-path> to set up a project"
echo "  3. Upgrading from the old copy-based flow? Run"
echo "     ./scan-legacy-agents.sh <projects-dir> to find project-local copies"
echo "     that still shadow the new global agents."
