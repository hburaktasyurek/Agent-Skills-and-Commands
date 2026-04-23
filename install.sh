#!/usr/bin/env bash
# install.sh — Set up agent skills and commands on a new machine
# Usage: ./install.sh
#
# Interactive: asks which categories to install (skills / commands / agents)
# and whether to remove any non-symlink leftovers it finds in the target dirs.
# On a non-TTY (piped/CI) run, defaults to installing everything and leaves
# non-symlink files untouched.

set -e
trap 'echo "✗ error on line $LINENO" >&2' ERR

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── Helpers ──────────────────────────────────────────────────────────────────

# ask_yn <question> [default=Y|N]  → returns 0 for yes, 1 for no.
# On a non-TTY stdin, returns the default without prompting.
ask_yn() {
  local question="$1"
  local default="${2:-Y}"
  local hint
  if [ "$default" = "Y" ]; then hint="[Y/n]"; else hint="[y/N]"; fi

  if [ ! -t 0 ]; then
    [ "$default" = "Y" ]
    return
  fi

  local reply
  read -r -p "$question $hint " reply
  reply="${reply:-$default}"
  case "$reply" in
    [Yy]|[Yy][Ee][Ss]) return 0 ;;
    *) return 1 ;;
  esac
}

# offer_cleanup <target_dir> <pattern>
# Lists non-symlink entries matching pattern in target_dir. If any exist and
# the user confirms, removes them. Pattern is a shell glob ('*' or '*.md').
offer_cleanup() {
  local dir="$1"
  local pattern="$2"
  local leftovers=()

  shopt -s nullglob
  for entry in "$dir"/$pattern; do
    [ -e "$entry" ] || continue
    [ -L "$entry" ] && continue
    leftovers+=("$entry")
  done
  shopt -u nullglob

  [ ${#leftovers[@]} -eq 0 ] && return 0

  echo "  ! Found ${#leftovers[@]} non-symlink entr$([ ${#leftovers[@]} -eq 1 ] && echo 'y' || echo 'ies') in $dir:"
  for e in "${leftovers[@]}"; do echo "      $(basename "$e")"; done

  if ask_yn "  Remove them so fresh symlinks can be created?" "N"; then
    for e in "${leftovers[@]}"; do rm -rf "$e"; echo "    ✗ removed $(basename "$e")"; done
  else
    echo "  · keeping them; symlinks for these names will be skipped."
  fi
}

# ── Banner ───────────────────────────────────────────────────────────────────

echo "Agent Skills and Commands — Installation"
echo "Repo: $REPO_DIR"
echo ""
echo "You'll be asked per category. Press Enter to accept the default."
echo ""

# ── 1. Skills ────────────────────────────────────────────────────────────────

if ask_yn "Install Claude Code skills (~/.claude/skills/)?" "Y"; then
  echo "→ Skills"
  mkdir -p "$HOME/.claude/skills"
  offer_cleanup "$HOME/.claude/skills" "*"

  for existing in "$HOME/.claude/skills"/*/; do
    [ -L "${existing%/}" ] || continue
    skill_name=$(basename "${existing%/}")
    [ -d "$REPO_DIR/skills/$skill_name" ] || { rm "${existing%/}"; echo "  ✗ removed stale: $skill_name"; }
  done

  for skill_dir in "$REPO_DIR/skills"/*/; do
    [ -d "$skill_dir" ] || continue
    skill_name=$(basename "$skill_dir")
    target="$HOME/.claude/skills/$skill_name"
    if [ -e "$target" ] && [ ! -L "$target" ]; then
      echo "  · skipped (non-symlink exists): $skill_name"
      continue
    fi
    [ -L "$target" ] && rm "$target"
    ln -s "$skill_dir" "$target"
    echo "  ✓ $skill_name"
  done
  echo ""
fi

# ── 2. Commands ──────────────────────────────────────────────────────────────

if ask_yn "Install Claude Code slash commands (~/.claude/commands/)?" "Y"; then
  echo "→ Commands"
  mkdir -p "$HOME/.claude/commands"
  offer_cleanup "$HOME/.claude/commands" "*.md"

  for existing in "$HOME/.claude/commands"/*.md; do
    [ -L "$existing" ] || continue
    cmd_name=$(basename "$existing")
    [ -f "$REPO_DIR/commands/$cmd_name" ] || { rm "$existing"; echo "  ✗ removed stale: $cmd_name"; }
  done

  for cmd_file in "$REPO_DIR/commands"/*.md; do
    [ -f "$cmd_file" ] || continue
    cmd_name=$(basename "$cmd_file")
    target="$HOME/.claude/commands/$cmd_name"
    if [ -e "$target" ] && [ ! -L "$target" ]; then
      echo "  · skipped (non-symlink exists): $cmd_name"
      continue
    fi
    [ -L "$target" ] && rm "$target"
    ln -s "$cmd_file" "$target"
    echo "  ✓ $cmd_name"
  done
  echo ""
fi

# ── 3. Global subagents ──────────────────────────────────────────────────────

if ask_yn "Install Claude Code global subagents (~/.claude/agents/)?" "Y"; then
  echo "→ Global subagents"
  mkdir -p "$HOME/.claude/agents"
  offer_cleanup "$HOME/.claude/agents" "*.md"

  for existing in "$HOME/.claude/agents"/*.md; do
    [ -L "$existing" ] || continue
    agent_name=$(basename "$existing")
    [ -f "$REPO_DIR/agents/$agent_name" ] || { rm "$existing"; echo "  ✗ removed stale: $agent_name"; }
  done

  for agent_file in "$REPO_DIR/agents"/*.md; do
    [ -f "$agent_file" ] || continue
    agent_name=$(basename "$agent_file")
    target="$HOME/.claude/agents/$agent_name"
    if [ -e "$target" ] && [ ! -L "$target" ]; then
      echo "  · skipped (non-symlink exists): $agent_name"
      continue
    fi
    [ -L "$target" ] && rm "$target"
    ln -s "$agent_file" "$target"
    echo "  ✓ $agent_name"
  done
  echo ""
fi

# ── Done ─────────────────────────────────────────────────────────────────────

echo "✓ Installation complete!"
echo ""
echo "Next steps:"
echo "  1. Configure ~/.claude/settings.json as you like (allow-list, MCP servers, etc.)"
echo "  2. Run ./init-project.sh <project-path> to set up a project"
echo "  3. Upgrading from the old copy-based flow? Run"
echo "     ./scan-legacy-agents.sh <projects-dir> to find project-local copies"
echo "     that still shadow the new global agents."
