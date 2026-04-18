---
name: create-hook
description: >-
  Create Cursor hooks. Use when you want to create a hook, write hooks.json, add
  hook scripts, or automate behavior around agent events.
---
# Creating Cursor Hooks

Create hooks when you want Cursor to run custom logic before or after agent events. Hooks are scripts or prompt-based checks that exchange JSON over stdin/stdout and can observe, block, modify, or follow up on behavior.

When the user asks for a hook, don't stop at describing the format. Gather the missing requirements, then create or update the hook files directly.

## Gather Requirements

Before you write anything, determine:

1. **Scope**: Should this be a project hook or a user hook?
2. **Trigger**: Which event should run the hook?
3. **Behavior**: Should it audit, deny/allow, rewrite input, inject context, or continue a workflow?
4. **Implementation**: Should it be a command hook (script) or a prompt hook?
5. **Filtering**: Does it need a matcher so it only runs for certain tools, commands, or subagent types?
6. **Safety**: Should failures fail open or fail closed?

Infer these from the conversation when possible. Only ask for the missing pieces.

## Choose the Right Location

- **Project hooks**: `.cursor/hooks.json` and `.cursor/hooks/*`
- **User hooks**: `~/.cursor/hooks.json` and `~/.cursor/hooks/*`

Path behavior matters:

- **Project hooks** run from the project root, so use paths like `.cursor/hooks/my-hook.sh`
- **User hooks** run from `~/.cursor/`, so use paths like `./hooks/my-hook.sh` or `hooks/my-hook.sh`

Prefer **project hooks** when the behavior should be shared with the repository and checked into version control.

## Choose the Hook Event

Use the narrowest event that matches the user's goal.

### Common Agent events

- `sessionStart`, `sessionEnd`: set up or audit a session
- `preToolUse`, `postToolUse`, `postToolUseFailure`: work across all tools
- `subagentStart`, `subagentStop`: control or continue Task/subagent workflows
- `beforeShellExecution`, `afterShellExecution`: gate or audit terminal commands
- `beforeMCPExecution`, `afterMCPExecution`: gate or audit MCP tool calls
- `beforeReadFile`, `afterFileEdit`: control file reads or post-process edits
- `beforeSubmitPrompt`: validate prompts before they are sent
- `preCompact`: observe context compaction
- `stop`: handle agent completion
- `afterAgentResponse`, `afterAgentThought`: track agent output or reasoning

### Quick event chooser

- **Block or approve shell commands** -> `beforeShellExecution`
- **Audit shell output** -> `afterShellExecution`
- **Format files after edits** -> `afterFileEdit`
- **Block or rewrite a specific tool call** -> `preToolUse`
- **Add follow-up context after a tool succeeds** -> `postToolUse`
- **Control whether subagents can run** -> `subagentStart`
- **Chain subagent loops** -> `subagentStop`
- **Check prompts for secrets or policy violations** -> `beforeSubmitPrompt`
- **Protect MCP calls** -> `beforeMCPExecution`

## Hooks File Format

```json
{
  "version": 1,
  "hooks": {
    "afterFileEdit": [
      {
        "command": ".cursor/hooks/format.sh"
      }
    ]
  }
}
```

Each hook definition can include:

- `command`: shell command or script path
- `type`: `"command"` or `"prompt"` (defaults to `"command"`)
- `timeout`: timeout in seconds
- `matcher`: filter for when the hook runs
- `failClosed`: block the action when the hook crashes, times out, or returns invalid JSON

## Matchers

- `preToolUse` / `postToolUse`: match on tool type such as `Shell`, `Read`, `Write`, `Task`
- `beforeShellExecution`: match on the full shell command string
- Matchers use JavaScript regex — not POSIX. Use `\s` not `[[:space:]]`

## Command Hooks

Command hooks receive JSON on stdin and can return JSON on stdout.

- Exit code `0`: success
- Exit code `2`: block the action
- Other non-zero: fail open by default (unless `failClosed: true`)

Always make hook scripts executable after creating them.

## Prompt Hooks

```json
{
  "version": 1,
  "hooks": {
    "beforeShellExecution": [
      {
        "type": "prompt",
        "prompt": "Does this command look safe? Only allow read-only operations. Input: $ARGUMENTS",
        "timeout": 10
      }
    ]
  }
}
```

## Event Output Fields

- `preToolUse`: `permission`, `user_message`, `agent_message`, `updated_input`
- `postToolUse`: `additional_context`
- `subagentStart`: `permission`, `user_message`
- `subagentStop`: `followup_message`
- `beforeShellExecution`: `permission`, `user_message`, `agent_message`

## Implementation Workflow

1. Pick the correct location and event
2. Create or update `hooks.json`
3. Start with no matcher or the simplest safe matcher
4. Create the script under the matching hooks directory
5. Make the script executable
6. Verify helper executables (jq, python3, etc.) are installed and on `$PATH`
7. Test by triggering the relevant action

## Final Checklist

- [ ] Correct hook location and path style
- [ ] Narrowest correct event chosen
- [ ] Matcher added when appropriate
- [ ] Only supported output fields returned
- [ ] Script made executable
- [ ] Tested by triggering the real event
