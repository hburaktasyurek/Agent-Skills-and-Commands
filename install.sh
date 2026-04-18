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

# ── 3. Cursor skills ─────────────────────────────────────────────────────────
if [ -d "$HOME/.cursor" ]; then
  echo ""
  echo "→ Cursor skills (~/.cursor/skills/)"
  mkdir -p "$HOME/.cursor/skills"

  for skill_dir in "$REPO_DIR/cursor/skills"/*/; do
    [ -d "$skill_dir" ] || continue
    skill_name=$(basename "$skill_dir")
    target="$HOME/.cursor/skills/$skill_name"
    [ -L "$target" ] && rm "$target"
    ln -s "$skill_dir" "$target"
    echo "  ✓ $skill_name"
  done
else
  echo ""
  echo "→ Cursor not found, skipping cursor skills"
fi

# ── 4. Claude Code settings ──────────────────────────────────────────────────
echo ""
if [ ! -f "$HOME/.claude/settings.json" ]; then
  cp "$REPO_DIR/config/settings.template.json" "$HOME/.claude/settings.json"
  echo "✓ Created ~/.claude/settings.json from template"
  echo "  ⚠️  Edit ~/.claude/settings.json to add machine-specific additionalDirectories"
else
  echo "→ ~/.claude/settings.json already exists, skipping"
  echo "  (compare with config/settings.template.json if needed)"
fi

# ── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo "✓ Installation complete!"
echo ""
echo "Next steps:"
echo "  1. Edit ~/.claude/settings.json to add machine-specific paths"
echo "  2. Run ./init-project.sh <project-path> to set up a project"
echo "  3. Run ./update-agents.sh to check agent versions across projects"
