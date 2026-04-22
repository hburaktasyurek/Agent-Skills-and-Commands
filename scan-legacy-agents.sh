#!/usr/bin/env bash
# scan-legacy-agents.sh — Find project-local agent copies that shadow the new
# global agents (~/.claude/agents/) after migrating away from the old
# agent-templates copy-based flow.
#
# A project-local .claude/agents/<name>.md that is a real copy (not a symlink)
# takes precedence over ~/.claude/agents/<name>.md, so upgrades to the global
# agents have no effect in that project until the copy is removed.
#
# This script reports shadowed paths. It does NOT delete — migration of any
# per-project context into .claude/agent-memory/<name>/learned-context.md is
# a manual step.
#
# Usage: ./scan-legacy-agents.sh <projects-dir>
#        ./scan-legacy-agents.sh ~/projects

set -e
trap 'echo "✗ error on line $LINENO" >&2' ERR

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -z "${1:-}" ]; then
  echo "Usage: $0 <projects-dir>"
  echo ""
  echo "Scans <projects-dir> recursively for .claude/agents/<name>.md files that"
  echo "are real copies (not symlinks) and shadow a same-named global agent in"
  echo "$REPO_DIR/agents/. Reports paths; does not delete."
  exit 1
fi

if [ ! -d "$1" ]; then
  echo "Error: '$1' is not a directory"
  exit 1
fi

SCAN_DIR="$(cd "$1" && pwd)"

# Collect global agent filenames (e.g. cto.md, ux-expert.md).
GLOBAL_AGENTS=()
for agent_file in "$REPO_DIR/agents"/*.md; do
  [ -f "$agent_file" ] || continue
  GLOBAL_AGENTS+=("$(basename "$agent_file")")
done

if [ "${#GLOBAL_AGENTS[@]}" -eq 0 ]; then
  echo "No global agents found in $REPO_DIR/agents/ — nothing to check."
  exit 0
fi

echo "Scanning: $SCAN_DIR"
echo "Tracking: ${GLOBAL_AGENTS[*]}"
echo ""

found_any=0
# Walk up to 6 levels deep to cover typical layouts like <projects>/<group>/<project>/.claude/agents.
while IFS= read -r -d '' agents_dir; do
  for agent_filename in "${GLOBAL_AGENTS[@]}"; do
    legacy="$agents_dir/$agent_filename"
    if [ -f "$legacy" ] && [ ! -L "$legacy" ]; then
      if [ "$found_any" -eq 0 ]; then
        echo "⚠️  Legacy agent copies shadowing global symlinks:"
        echo ""
        found_any=1
      fi
      echo "   $legacy"
    fi
  done
done < <(find "$SCAN_DIR" -maxdepth 6 -type d -path '*/.claude/agents' -print0 2>/dev/null)

if [ "$found_any" -eq 0 ]; then
  echo "✓ No legacy copies found — all matching project agents are symlinks or absent."
  exit 0
fi

echo ""
echo "Migration for each file:"
echo "  1. Move any project-specific prose from the copy's ## PROJECT CONTEXT"
echo "     section into <project>/.claude/agent-memory/<name>/learned-context.md"
echo "  2. Delete the copy so the global symlink at ~/.claude/agents/<name>.md"
echo "     becomes effective."
