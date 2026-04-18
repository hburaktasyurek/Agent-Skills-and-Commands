# Agent Skills and Commands

Centralized repository for AI agent skills, commands, and templates. Clone once, use everywhere.

## Structure

```
├── skills/                    # Claude Code skills (symlinked to ~/.claude/skills/)
│   ├── tdd/                   # Test-driven development
│   ├── grill-me/              # Design interview / stress-test a plan
│   ├── triage-issue/          # Bug investigation + GitHub issue creation
│   ├── request-refactor-plan/ # Refactor planning with incremental commits
│   └── improve-codebase-architecture/  # Architecture analysis
│
├── commands/                  # Claude Code global commands (symlinked to ~/.claude/commands/)
│   └── make-agent-do-things.md  # Delegate to senior engineer agents
│
├── agents/                    # Agent templates (CORE + PROJECT CONTEXT structure)
│   ├── ux-expert.md           # UX expert agent template
│   ├── product-lead.md        # CPO/Head of Product agent template
│   ├── tech-review-cto.md     # CTO technical reviewer template
│   └── spec-compliance-reviewer.md  # Spec vs implementation QA template
│
├── standards/                 # agent-os standard commands (symlinked per project)
│   ├── shape-spec.md          # Plan mode spec shaping
│   ├── plan-product.md        # Product documentation setup
│   ├── inject-standards.md    # Inject relevant standards into context
│   ├── index-standards.md     # Rebuild standards index
│   └── discover-standards.md  # Extract codebase patterns as standards
│
├── cursor/                    # Cursor-specific files
│   ├── skills/                # Cursor skills (symlinked to ~/.cursor/skills/)
│   │   ├── shell/             # Run literal shell commands
│   │   ├── babysit/           # Keep a PR merge-ready
│   │   ├── create-hook/       # Create Cursor hooks
│   │   ├── create-rule/       # Create Cursor rules
│   │   ├── create-skill/      # Guide for creating new skills
│   │   ├── create-subagent/   # Create custom subagents
│   │   ├── migrate-to-skills/ # Convert rules/commands to skills
│   │   ├── statusline/        # Configure CLI status line
│   │   ├── update-cli-config/ # Modify Cursor CLI config
│   │   └── update-cursor-settings/ # Modify Cursor editor settings
│   └── mcp.template.json      # MCP server config template (copy → mcp.json, add keys)
│
└── config/
    └── settings.template.json # Claude Code global settings template
```

## New Machine Setup

```bash
git clone <repo-url> ~/agent-skills
cd ~/agent-skills
./install.sh
```

`install.sh` creates symlinks for skills and commands, copies settings template.

Then edit `~/.claude/settings.json` to add your machine-specific `additionalDirectories`.

## New Project Setup

```bash
cd ~/agent-skills
./init-project.sh /path/to/my-project
```

`init-project.sh`:
1. Symlinks agent-os standard commands to `.claude/commands/agent-os/`
2. Lets you pick which agent templates to copy
3. Sets up `.claude/agent-memory/` directories
4. Prompts you to customize the `## PROJECT CONTEXT` section in each agent

## Keeping Agents Updated

When a template agent is improved (new Claude update, better prompting, etc.):

```bash
./update-agents.sh /path/to/projects/dir
```

Shows which project agents are behind their templates. To update manually:
1. Open the project agent file
2. Compare `## CORE` with the template
3. Update `## CORE`, keep `## PROJECT CONTEXT` unchanged
4. Update the `based-on` header with today's date + time

## Agent Template Structure

Each agent template uses this structure:

```markdown
---
based-on: agent-name@YYYY-MM-DD-HHMM
name: agent-name
description: "..."
model: sonnet
memory: project
---

## CORE
[Generic, reusable agent behavior — update when template improves]

---

## PROJECT CONTEXT
[Project-specific context — customize per project, never overwritten by updates]
```

## Cursor MCP Config

`cursor/mcp.template.json` is a placeholder for MCP server configurations. Copy it and add your API keys — never commit the real file.
