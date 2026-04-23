#!/usr/bin/env bash
# bootstrap.sh — one-shot installer/updater.
#
# Clones this repo to ~/agent-skills (or pulls latest if already there),
# then runs ./install.sh. Same command covers first install and update.
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/hburaktasyurek/Agent-Skills-and-Commands/main/bootstrap.sh | bash
#
# Env vars:
#   AGENT_SKILLS_DIR   — install location (default: $HOME/agent-skills)
#   AGENT_SKILLS_REPO  — git URL to clone (default: hburaktasyurek/Agent-Skills-and-Commands)
#   AGENT_SKILLS_REF   — branch/tag to track (default: main)

set -e
trap 'echo "✗ bootstrap error on line $LINENO" >&2' ERR

REPO_URL="${AGENT_SKILLS_REPO:-https://github.com/hburaktasyurek/Agent-Skills-and-Commands}"
INSTALL_DIR="${AGENT_SKILLS_DIR:-$HOME/agent-skills}"
REF="${AGENT_SKILLS_REF:-main}"

command -v git >/dev/null 2>&1 || { echo "Error: git not found in PATH" >&2; exit 1; }
command -v bash >/dev/null 2>&1 || { echo "Error: bash not found in PATH" >&2; exit 1; }

if [ -d "$INSTALL_DIR/.git" ]; then
  echo "→ Updating existing clone at $INSTALL_DIR"
  if [ -n "$(git -C "$INSTALL_DIR" status --porcelain)" ]; then
    echo "  ! Uncommitted changes detected — skipping pull, using current checkout"
  else
    git -C "$INSTALL_DIR" fetch --quiet origin "$REF"
    git -C "$INSTALL_DIR" checkout --quiet "$REF"
    git -C "$INSTALL_DIR" pull --ff-only --quiet origin "$REF"
  fi
else
  echo "→ Cloning $REPO_URL to $INSTALL_DIR"
  git clone --quiet --branch "$REF" "$REPO_URL" "$INSTALL_DIR"
fi

cd "$INSTALL_DIR"

[ -x "./install.sh" ] || { echo "Error: install.sh not executable in $INSTALL_DIR" >&2; exit 1; }

# Tell install.sh not to pull again — we just did it.
export AGENT_SKILLS_SKIP_PULL=1
exec ./install.sh "$@"
