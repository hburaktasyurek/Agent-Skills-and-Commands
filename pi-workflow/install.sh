#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PI_HOME="${PI_CODING_AGENT_DIR:-$HOME/.pi/agent}"
MODE="${1:-install}"

PACKAGES=(
  "npm:pi-subagents@0.49.0"
  "npm:@juicesharp/rpiv-ask-user-question@2.5.1"
  "npm:@hk_net/pi-thinking-command@0.1.7"
)

require_command() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing command: $1" >&2
    exit 1
  }
}

check_installation() {
  local failed=0
  local source target

  for source in "$SCRIPT_DIR"/agents/*.md; do
    target="$PI_HOME/agents/$(basename "$source")"
    if ! cmp -s "$source" "$target"; then
      echo "MISMATCH: $target" >&2
      failed=1
    fi
  done

  target="$PI_HOME/extensions/hospital-spec.ts"
  if ! cmp -s "$SCRIPT_DIR/extensions/hospital-spec.ts" "$target"; then
    echo "MISMATCH: $target" >&2
    failed=1
  fi

  for skill in task-groundwork to-spec commit-work adversarial-spec-review spec-readiness senior-implementer tdd review-implementation adversarial-diff-review pr-branch risk-calibrated-pr-review; do
    if [[ ! -f "$HOME/.agents/skills/$skill/SKILL.md" ]]; then
      echo "MISSING SKILL: $skill" >&2
      failed=1
    fi
  done

  if [[ ! -f "$PI_HOME/settings.json" ]]; then
    echo "MISSING: $PI_HOME/settings.json" >&2
    failed=1
  else
    for package in "${PACKAGES[@]}"; do
      if ! node -e 'const fs=require("fs"); const [file,pkg]=process.argv.slice(1); const data=JSON.parse(fs.readFileSync(file,"utf8")); process.exit(Array.isArray(data.packages)&&data.packages.includes(pkg)?0:1)' "$PI_HOME/settings.json" "$package"; then
        echo "MISSING PACKAGE: $package" >&2
        failed=1
      fi
    done
  fi

  if [[ "$failed" -ne 0 ]]; then
    return 1
  fi

  pi --offline --no-session --print "/hospital-spec self-test" >/dev/null
  echo "pi-workflow check: PASS"
}

require_command node
require_command npm
require_command npx

if [[ "$MODE" == "--check" ]]; then
  require_command pi
  check_installation
  exit 0
fi

if [[ "$MODE" != "install" ]]; then
  echo "Usage: $0 [install|--check]" >&2
  exit 2
fi

if ! command -v pi >/dev/null 2>&1; then
  npm install --global @earendil-works/pi-coding-agent@0.84.2
fi

npx skills@latest add "$REPO_ROOT" -g --all --copy

for package in "${PACKAGES[@]}"; do
  pi install "$package"
done

install -d -m 700 "$PI_HOME/agents" "$PI_HOME/extensions"
for source in "$SCRIPT_DIR"/agents/*.md; do
  install -m 600 "$source" "$PI_HOME/agents/$(basename "$source")"
done
install -m 600 "$SCRIPT_DIR/extensions/hospital-spec.ts" "$PI_HOME/extensions/hospital-spec.ts"

check_installation

