---
name: statusline
description: >-
  Configure a custom status line in the CLI. Use when the user mentions status
  line, statusline, statusLine, CLI status bar, prompt footer customization, or
  wants to add session context above the prompt.
---
# CLI Status Line

The CLI supports a user-configurable status line rendered above the prompt. A command is spawned on each conversation update, receives a JSON payload on stdin describing the session, and its stdout is displayed as the status line.

## Configuration

Add a `statusLine` entry to `~/.cursor/cli-config.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "~/.cursor/statusline.sh",
    "padding": 2
  }
}
```

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `type` | yes | — | Must be `"command"` |
| `command` | yes | — | Path to executable or inline command. `~` is expanded. |
| `padding` | no | `0` | Horizontal inset (in characters) |
| `updateIntervalMs` | no | `300` | Minimum interval between invocations (clamped >= 300ms) |
| `timeoutMs` | no | `2000` | Maximum time command may run before killed |

## Stdin payload

The command receives a JSON object on stdin with these key fields:

| Field | Description |
|-------|-------------|
| `session_id` | Unique session identifier |
| `model.display_name` | Current model name |
| `context_window.used_percentage` | % of context window used |
| `workspace.current_dir` | Current working directory |
| `vim.mode` | `"NORMAL"` or `"INSERT"` (only when vim mode enabled) |
| `worktree.name` | Worktree name (only when in a worktree) |

Fields `session_name`, `model.param_summary`, `model.max_mode`, `vim`, and `worktree` may be absent.

## Examples

### Basic: model + context usage

```bash
#!/usr/bin/env bash
payload=$(cat)
model=$(echo "$payload" | jq -r '.model.display_name')
pct=$(echo "$payload" | jq -r '.context_window.used_percentage // 0' | cut -d. -f1)
printf "\033[90m%s  ctx %s%%\033[0m" "$model" "$pct"
```

### Context progress bar

```bash
#!/usr/bin/env bash
input=$(cat)
MODEL=$(echo "$input" | jq -r '.model.display_name')
PCT=$(echo "$input" | jq -r '.context_window.used_percentage // 0' | cut -d. -f1)

BAR_WIDTH=10
FILLED=$((PCT * BAR_WIDTH / 100))
EMPTY=$((BAR_WIDTH - FILLED))
BAR=""
[ "$FILLED" -gt 0 ] && printf -v FILL "%${FILLED}s" && BAR="${FILL// /▓}"
[ "$EMPTY" -gt 0 ] && printf -v PAD "%${EMPTY}s" && BAR="${BAR}${PAD// /░}"

echo "[$MODEL] $BAR $PCT%"
```

### Multi-line with git info

```bash
#!/usr/bin/env bash
input=$(cat)
MODEL=$(echo "$input" | jq -r '.model.display_name')
DIR=$(echo "$input" | jq -r '.workspace.current_dir')
PCT=$(echo "$input" | jq -r '.context_window.used_percentage // 0' | cut -d. -f1)

BRANCH=""
git rev-parse --git-dir > /dev/null 2>&1 && BRANCH=" | 🌿 $(git branch --show-current 2>/dev/null)"

echo -e "\033[36m[$MODEL]\033[0m 📁 ${DIR##*/}$BRANCH"
echo -e "ctx $PCT%"
```

## Testing

Test a script with mock input:

```bash
echo '{"model":{"display_name":"Opus"},"context_window":{"used_percentage":25}}' | ./statusline.sh
```
