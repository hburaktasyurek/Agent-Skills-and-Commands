# Pi Hospital Workflow

This directory is the source of truth for the Pi workflow. Global files under
`~/.pi/agent/` are installed copies. Make fixes here, review the diff, then run
the installer again.

## What is included

```text
pi-workflow/
├── agents/                 # pinned hospital roles
├── extensions/
│   ├── hospital-spec.ts    # visible main-session supervisor and async launcher
│   └── hospital-control/   # tested state, signal, steering, and widget core
├── tests/                  # deterministic control-loop tests
├── EXTENSIONS.md           # reviewed extension candidates and decisions
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

The packages considered but intentionally not installed are recorded in
[EXTENSIONS.md](EXTENSIONS.md), including the conditions for reconsidering
Todo, loop protection, goal/audit automation, TUI layers, and alternative
orchestrators.

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

Before starting, Hospital Spec shows the exact repository and task for
confirmation. It also asks before changing the main model to DeepSeek V4
Pro/high. Every specialist is then launched as a top-level async run with
fresh context. The main session remains available while the child works.

Normal operation needs only one command:

```text
/hospital-spec <task description>
```

After that, talk to the main agent naturally. Examples:

```text
Şu an ne yapıyor, hangi kanıta bakıyor?
Yanlış dosyaya yöneldi; önce booking-form.php içindeki owner'ı doğrulasın.
Bu varsayımı yapmasın, mevcut lock içinde kalsın.
Bu workflow'u durdur.
```

The main supervisor resolves the exact active run id, records a durable
`C-xxx` correction, and sends it with `subagent steer`. Delivery, child ACK,
evidence-backed verification, and application are separate states. A delivered
message is never presented as an applied correction. Parallel review targets
must be unambiguous; Hospital asks instead of broadcasting a correction.

A persistent panel above the editor refreshes every second from Hospital state
and `pi-subagents` status. It shows the phase, agent/model, elapsed time,
current tool/path, recent observable activity, open assumptions, corrections,
and protocol errors. It does not post periodic chat heartbeats. Use
`Ctrl+Alt+F` for the full Fleet transcript, `s` for deterministic direct
steering, and `D` to stop. Fleet steering is reconciled into Hospital's ledger,
so the direct path cannot bypass ACK and application checks.

Decision-bearing uncertainty is explicit. A child opens an assumption with a
structured `HOSPITAL_SIGNAL`, identifies its verification target, and resolves
it with concrete evidence. While an assumption or correction is unresolved,
the child may inspect evidence but must not write/stage an artifact or complete
its stage. Hospital checkpoints and the final gate enforce the stage boundary
mechanically. A rejected assumption or confirmed user correction invalidates
the earliest affected phase, clears stale commit/review authority, and reruns
the downstream stages while preserving an existing spec identity.

When a child needs an owner decision, the native supervisor channel wakes the
main session. The main agent asks the exact question, preserves the user's
answer, and replies to the waiting child. After compaction or restart, the
parent checks the durable Hospital checkpoint plus Pi's mission/run ledger
before continuing; it never launches a duplicate while the old run is active.

`/hospital-spec` without arguments prints the current durable state. The
diagnostic `/hospital-spec self-test` verifies the pinned agents and required
Pi tools; neither is needed during ordinary operation.

Run the deterministic source tests after changing the control core:

```bash
node --experimental-strip-types --test pi-workflow/tests/hospital-control.test.ts
```

They cover state migration, signal identity and deduplication, delivery versus
application, ACK ordering, invalidation, Fleet reconciliation, widget output,
and terminal gate receipts.

## State and generated data

Project source trees receive no orchestration state files. Runtime state lives
under:

```text
~/.pi/agent/state/hospital-spec/<project-hash>.json
```

Pi-subagents owns its own temporary session, mission, and run artifacts.
Credentials, sessions, runtime state, and model outputs must not be committed
here.

## Change and deploy

1. Edit only `pi-workflow/agents/` or `pi-workflow/extensions/`.
2. Inspect the exact Git diff.
3. Run `./pi-workflow/install.sh` to copy the repository version globally.
4. Run `./pi-workflow/install.sh --check`.
5. Exercise the changed behavior on a real task. Do not replace real-task
   evidence with synthetic or model-judged evals.

The installer is intentionally one-way: repository to global installation.
Never repair the repository by copying unknown global state back over it.
