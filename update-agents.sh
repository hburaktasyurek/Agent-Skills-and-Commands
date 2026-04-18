#!/usr/bin/env bash
# update-agents.sh — Check which project agents are behind their templates
# Usage: ./update-agents.sh [projects-dir]
#        ./update-agents.sh /Volumes/DevSSD/DevProjects

set -e

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECTS_DIR="${1:-$HOME}"

echo "Agent Version Check"
echo "Templates: $REPO_DIR/agents/"
echo "Scanning:  $PROJECTS_DIR"
echo ""

outdated=0
checked=0

# Find all .claude/agents/ directories
while IFS= read -r -d '' agents_dir; do
  project_path="$(dirname "$(dirname "$agents_dir")")"
  project_name="$(basename "$project_path")"

  for project_agent in "$agents_dir"*.md; do
    [ -f "$project_agent" ] || continue
    agent_name=$(basename "$project_agent")
    template_file="$REPO_DIR/agents/$agent_name"

    [ -f "$template_file" ] || continue

    ((checked++))

    # Extract based-on date from project agent
    project_version=$(grep -m1 "^based-on:" "$project_agent" 2>/dev/null | sed 's/based-on: [^@]*@//' || echo "")
    template_version=$(grep -m1 "^based-on:" "$template_file" 2>/dev/null | sed 's/based-on: [^@]*@//' || echo "")

    if [ -z "$project_version" ]; then
      echo "  ⚠️  $project_name / $agent_name — no version header"
      ((outdated++))
    elif [ "$project_version" != "$template_version" ]; then
      echo "  🔴 $project_name / $agent_name"
      echo "     project:  $project_version"
      echo "     template: $template_version"
      ((outdated++))
    else
      echo "  ✓  $project_name / $agent_name — $project_version"
    fi
  done
done < <(find "$PROJECTS_DIR" -maxdepth 4 -type d -name "agents" -path "*/.claude/agents" -print0 2>/dev/null)

echo ""
echo "Checked: $checked agent(s)"

if [ "$outdated" -eq 0 ]; then
  echo "✓ All agents are up to date!"
else
  echo "⚠️  $outdated agent(s) need updating"
  echo ""
  echo "To update an agent's CORE section:"
  echo "  1. Open the project agent file"
  echo "  2. Compare ## CORE with template in agents/<name>.md"
  echo "  3. Update ## CORE, keep ## PROJECT CONTEXT unchanged"
  echo "  4. Update the based-on header: based-on: <name>@$(date +%Y-%m-%d-%H%M)"
fi
