# Pi Hospital Workflow

This directory is the source of truth for the Pi workflow. Global files under
`~/.pi/agent/` are installed copies. Make fixes here, review the diff, then run
the installer again.

## What is included

```text
pi-workflow/
├── agents/                 # pinned hospital roles
├── extensions/
│   └── hospital-spec.ts    # automatic spec state machine and deterministic gate
├── install.sh              # install/sync and verification
└── README.md
```

The installer also installs every repository skill with `npx skills --copy`
and these pinned Pi packages:

- `pi-subagents@0.49.0`
- `@juicesharp/rpiv-ask-user-question@2.5.1`
- `@hk_net/pi-thinking-command@0.1.7`

If `pi` is absent, the installer installs
`@earendil-works/pi-coding-agent@0.84.2`. It does not replace an existing Pi
version.

## Install on a new computer

Prerequisites: Node.js/npm, Git, and this repository clone.

```bash
cd Agent-Skills-and-Commands
./pi-workflow/install.sh
```

Then authenticate the providers in Pi. The workflow needs both
`openai-codex` and `opencode-go`. Confirm them without exposing credentials:

```bash
pi auth check --provider openai-codex
pi auth check --provider opencode-go
```

Provider login itself is interactive in Pi's model/provider UI; credentials
are never stored in this repository.

Verify the installed copy at any time:

```bash
./pi-workflow/install.sh --check
```

## Staff and fixed models

| Role | Agent | Model | Effort |
|---|---|---|---|
| Parent/coordinator | active Pi session | DeepSeek V4 Pro | high |
| Groundwork | `workflow-groundwork` | DeepSeek V4 Pro | high |
| Evidence scanner | `workflow-evidence` | DeepSeek V4 Flash | high |
| Spec author | `workflow-to-spec` | GPT-5.6 Sol | high |
| Spec commit | `workflow-commit` | GPT-5.6 Luna | high |
| Adversarial review | `workflow-adversarial-spec` | GPT-5.6 Sol | high |
| Readiness review | `workflow-spec-readiness` | GPT-5.6 Terra | high |
| Independent consult | `workflow-consult` | Qwen3.8 Max | high |
| Implementation | `workflow-implement` | GPT-5.6 Sol | high |
| Implementation review | `workflow-implementation-review` | GPT-5.6 Terra | high |
| Optional diff review | `workflow-diff-review` | GPT-5.6 Sol | high |
| PR publication | `workflow-pr` | GPT-5.6 Luna | high |
| PR review | `workflow-pr-review` | GPT-5.6 Sol | high |

Every configured agent has `fallbackModels: []`. If its required model is not
available, the workflow blocks instead of substituting another model.

## Run the spec workflow

Start Pi inside the target Git repository:

```text
/hospital-spec <task description>
```

The spec output root is selected by `to-spec`; it does not need to be supplied.
The extension performs:

```text
groundwork → evidence → to-spec → commit
→ adversarial review + readiness review
→ deterministic gate
```

`FAIL` or `NOT READY` returns to a root-complete rewrite of the same spec. The
workflow stops only on the same committed revision receiving `PASS + READY`,
on a real owner question, or on `BLOCKED`. It commits the four spec files but
does not push.

Useful commands:

```text
/hospital-spec status
/hospital-spec answer <owner answer>
/hospital-spec self-test
```

The parent must be DeepSeek V4 Pro/high. If it is not, the extension asks once
before switching. Normal stage transitions are automatic; no manual
`continue` message is required. A Pi restart resumes a non-terminal project
from its last durable phase with fresh child context.

## State and generated data

Project source trees receive no orchestration state files. Runtime state lives
under:

```text
~/.pi/agent/state/hospital-spec/<project-hash>.json
```

Detached review worktrees live temporarily under the same state directory and
are removed by the extension. Credentials, sessions, runtime state, and model
outputs must not be committed here.

## Change and deploy

1. Edit only `pi-workflow/agents/` or `pi-workflow/extensions/`.
2. Inspect the exact Git diff.
3. Run `./pi-workflow/install.sh` to copy the repository version globally.
4. Run `./pi-workflow/install.sh --check`.
5. Exercise the changed behavior on a real task. Do not replace real-task
   evidence with synthetic or model-judged evals.

The installer is intentionally one-way: repository to global installation.
Never repair the repository by copying unknown global state back over it.

