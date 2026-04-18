#!/usr/bin/env bash
# init-project.sh — Initialize a project with shared agent templates and standards
# Usage: ./init-project.sh [project-path]
#        ./init-project.sh /path/to/my-project

set -e

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
mkdir -p "$PROJECT_PATH/.claude/agents"

# ── 2. Symlink agent-os standard commands ────────────────────────────────────
echo "→ Linking agent-os standard commands (.claude/commands/agent-os/)"

for cmd_file in "$REPO_DIR/standards"/*.md; do
  [ -f "$cmd_file" ] || continue
  cmd_name=$(basename "$cmd_file")
  target="$PROJECT_PATH/.claude/commands/agent-os/$cmd_name"
  [ -L "$target" ] && rm "$target"
  ln -s "$cmd_file" "$target"
  echo "  ✓ $cmd_name"
done

# ── 3. Select agents to copy ─────────────────────────────────────────────────
echo ""
echo "Available agent templates:"

agents=()
i=1
for agent_file in "$REPO_DIR/agents"/*.md; do
  [ -f "$agent_file" ] || continue
  agent_name=$(basename "$agent_file" .md)
  echo "  $i) $agent_name"
  agents+=("$agent_file")
  ((i++))
done

echo ""
echo "Which agents to copy? (space-separated numbers, 'all', or 'none')"
echo -n "> "
read -r selection

if [ "$selection" = "all" ]; then
  selected_agents=("${agents[@]}")
elif [ "$selection" = "none" ]; then
  selected_agents=()
else
  selected_agents=()
  for num in $selection; do
    idx=$((num - 1))
    if [ "$idx" -ge 0 ] && [ "$idx" -lt "${#agents[@]}" ]; then
      selected_agents+=("${agents[$idx]}")
    fi
  done
fi

# ── 4. Copy and configure selected agents ────────────────────────────────────
if [ "${#selected_agents[@]}" -gt 0 ]; then
  echo ""
  echo "→ Copying agent templates (.claude/agents/)"

  for agent_file in "${selected_agents[@]}"; do
    agent_filename=$(basename "$agent_file")
    agent_name=$(basename "$agent_file" .md)
    target="$PROJECT_PATH/.claude/agents/$agent_filename"

    if [ -f "$target" ]; then
      echo "  → $agent_name already exists, skipping"
      continue
    fi

    cp "$agent_file" "$target"

    # Replace memory path placeholder
    memory_path="$PROJECT_PATH/.claude/agent-memory/$agent_name"
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s|\.claude/agent-memory/$agent_name|$memory_path|g" "$target"
    else
      sed -i "s|\.claude/agent-memory/$agent_name|$memory_path|g" "$target"
    fi

    # Create memory directory
    mkdir -p "$memory_path"

    echo "  ✓ $agent_name → customize PROJECT CONTEXT section"
  done
fi

# ── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo "✓ Project initialized: $PROJECT_NAME"
echo ""
echo "Next steps:"
echo "  1. Customize ## PROJECT CONTEXT in each .claude/agents/*.md"
echo "  2. Create CLAUDE.md if it doesn't exist"
echo "  3. Run /plan-product to populate agent-os/product/ docs"
