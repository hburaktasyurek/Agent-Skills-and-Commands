# Pi extension decision log

This document records the Pi packages and adjacent agent systems considered for
this repository. It is a decision log, not an install queue or a security
audit. Re-check upstream release notes and permissions before changing a
status. Snapshot: 2026-08-14.

## Decision rule

Hospital Spec already has one visible parent, one subagent runtime, durable
recovery, explicit owner questions, pinned models, and independent reviewers.
An extension is added only when it closes a demonstrated gap without creating
a second owner for orchestration, state, review, or the terminal UI.

Statuses mean:

- **Installed** — part of `pi-workflow/install.sh` and verified by `--check`.
- **Local** — maintained in this repository and installed by the same script.
- **Candidate** — useful, but install only after a concrete need or bounded
  trial.
- **Hold** — overlaps the current architecture or adds more risk/cost than
  current value.
- **Alternative** — could replace part of the stack; do not layer it on top.

## Current baseline

| Component | Status | Why |
|---|---|---|
| [`pi-subagents`](https://github.com/nicobailon/pi-subagents) | **Installed** | The one subagent runtime. It provides async runs, fresh contexts, missions, transcript/status inspection, steering, stopping, completion delivery, and the native supervisor question channel. |
| [`@juicesharp/rpiv-ask-user-question`](https://github.com/juicesharp/rpiv-mono/tree/main/packages/rpiv-ask-user-question) | **Installed** | Structured owner questions without forcing the model to guess. Small and complementary to the runtime. |
| [`@hk_net/pi-thinking-command`](https://github.com/hknet/pi-extensions/tree/main/packages/pi-thinking-command) | **Installed** | Small manual reasoning-level control. It does not own workflow state or model routing. |
| [`hospital-spec.ts`](extensions/hospital-spec.ts) | **Local** | The visible DeepSeek parent and Hospital-specific control plane. It launches only async children, keeps main interactive, shows live status, records assumptions/corrections, separates delivery from application, surfaces questions, and combines the two review verdicts mechanically. |

## Highest-value candidates

These are the only candidates worth an early trial. They are deliberately not
installed by default.

### `rpiv-todo` — candidate after the first real Hospital runs

[`rpiv-todo`](https://github.com/juicesharp/rpiv-mono/tree/main/packages/rpiv-todo)
provides a live task overlay that survives reload and compaction. It could help
when the operator needs a richer stage checklist than Hospital's compact live
control panel.

Do not install it merely to prove that work is happening: Hospital's persistent
panel shows run id, agent/model, tool/path, recent output, assumptions,
correction receipts, and activity counts. Trial
Todo only if real use shows that the missing information is task topology or
remaining work. If adopted, Hospital remains authoritative; Todo is a
read-only projection, not a second state machine.

### `pi-loop-police` — candidate for a controlled non-Hospital pilot

[`pi-loop-police`](https://github.com/sebaxzero/pi-loop-police) detects repeated
reasoning, tool-call cycles, excessive rereads, search expansion, and
cross-turn stagnation. This is potentially valuable for affordable models.

It can also block legitimate rereads and searches or trim reasoning. Hospital
reviewers intentionally inspect evidence deeply, so default thresholds must
not be trusted blindly. Pilot it in an ordinary session, inspect its detection
log, tune false positives, and only then consider enabling it during Hospital
runs.

### `pi-goal-list-loop-audit` — candidate for a separate implementation lane

[`pi-goal-list-loop-audit`](https://github.com/DraconDev/pi-goal-list-loop-audit)
offers confirmed goals, durable queues and loops, automatic continuation, and
a detached fresh auditor. It is a serious option for long-running
implementation or maintenance work after a spec exists.

It is not a Hospital Spec dependency. Both systems own continuation, durable
state, questions, and completion verification. Running them around the same
task would create competing supervisors. Evaluate it as a separate entrypoint
with a clear boundary: Hospital produces the accepted spec; Goal/List may later
execute a bounded implementation goal.

### One TUI layer — optional, choose one

- [`pi-cc-extensions`](https://github.com/minuque/pi-cc-extensions) adds a
  Claude-Code-style renderer, context inspection, and session/subagent
  references.
- [`pi-zentui`](https://github.com/lmilojevicc/pi-zentui) adds a configurable
  Starship/OpenCode-style editor and status line.

These improve presentation, not orchestration. Test only after Hospital's
native main-session UX is stable, and install at most one first. Multiple
renderers/status owners make terminal failures harder to attribute. Pi's
native fullscreen mode should be tried before either package. A session or
subagent reference picker helps inspect prior context, but it does not replace
Hospital's live `status`/`transcript` plus `steer` control path.

## Deliberate holds and alternatives

### `rpiv-mono`: take individual parts, not the full pipeline

[`rpiv-mono`](https://github.com/juicesharp/rpiv-mono) contains `rpiv-pi`,
`rpiv-workflow`, Todo, Advisor, web tools, and other packages.

- **Installed:** only `rpiv-ask-user-question`.
- **Candidate:** Todo, under the rule above.
- **Hold:** `rpiv-advisor`. Hospital already assigns stronger models to
  high-judgment roles and has independent reviewers. An advisor becomes useful
  if the main executor is deliberately downgraded to a cheap model. It is
  advisory, never a completion gate.
- **Alternative:** `rpiv-workflow` and the full `rpiv-pi` pipeline. Its typed
  multi-stage runner is capable, but it would duplicate Hospital's stage,
  recovery, question, and gate ownership. Adopt it only as a replacement after
  comparing operator UX—not alongside Hospital.

### Advisor extensions: choose zero or one

[`@hk_net/pi-advisor`](https://github.com/hknet/pi-extensions/tree/main/packages/pi-advisor)
and `rpiv-advisor` both forward context to a stronger reviewer. They may be
useful in a future cheap-parent configuration, but are held now because:

- the Hospital parent and judgment-heavy roles are already strong and pinned;
- forwarding a full transcript has privacy and token-cost implications;
- two advisors would add conflicting recommendations without adding authority.

If the model budget changes, compare the two on transcript scope, explicit
invocation, provider control, and cost, then select one.

The same [`hknet/pi-extensions`](https://github.com/hknet/pi-extensions)
collection also contains `pi-timestamp` and `pi-set-model`. Timestamp is held
until timing visibility is demonstrably missing; Hospital's live panel already
shows elapsed activity. Per-project model memory is held because Hospital pins its
parent and children explicitly, while an implicit remembered model could make
non-Hospital session behavior harder to predict.

### Competing orchestration frameworks

| Project | Status | Decision |
|---|---|---|
| [`pi-crew`](https://github.com/baphuongna/pi-crew) | **Alternative / hold** | Broad team, workflow, goal, worktree, scheduling, UI, and observability framework. It substantially overlaps `pi-subagents` and Hospital. Upstream explicitly warns that it is largely AI-generated, not hardened, and that dynamic workflows run with Pi-session privileges. Do not stack it into the current runtime. |
| [`rolebox`](https://github.com/EricMoin/rolebox) | **Separate OpenCode alternative** | Rolebox is an OpenCode plugin with YAML roles, persistent memory, graph execution, and LSP tools—not a Pi extension. It may be evaluated for an OpenCode-native workflow, but it does not belong in the Pi installer. |
| [`rpiv-workflow`](https://github.com/juicesharp/rpiv-mono/tree/main/packages/rpiv-workflow) | **Alternative** | A generic typed workflow runner. Reconsider only if replacing the custom Hospital supervisor becomes desirable. |

### Question and interview UI

[`pi-interview-tool`](https://github.com/nicobailon/pi-interview-tool) provides a
rich browser/native-window form with media, attachments, autosave, and queued
multi-agent interviews. It is held because the installed
`rpiv-ask-user-question` already covers Hospital's short owner decisions with
less UI and lifecycle complexity. Reconsider only when a task genuinely needs
rich media or a long multi-question interview.

### MCP adapters

- [`pi-mcp-extension`](https://github.com/irahardianto/pi-mcp-extension)
- [`pi-mcp` in pixu1980/pi-coding-agent-extensions`](https://github.com/pixu1980/pi-coding-agent-extensions/tree/main/packages/pi-mcp)

Hold both until a named MCP server is required and Pi lacks a direct extension
or native tool. Loading a generic adapter without a concrete server increases
tool surface and debugging cost. If the need appears, compare transport,
on-demand discovery, permission boundaries, and context overhead; install one.

### Cursor provider bridge

[`pi-cursor-sdk`](https://github.com/fitchmultz/pi-cursor-sdk) preserves
Cursor's SDK agent loop inside Pi and adds Cursor model/auth/session/tool
bridging. It is technically relevant only if Cursor models are intentionally
added to the staff. The present Codex and OpenCode Go accounts already cover
the chosen models, so another credential, provider runtime, and agent loop add
no current value.

### Other extension collections

[`MattDevy/pi-extensions`](https://github.com/MattDevy/pi-extensions) contains
continuous learning, Red/Green TDD enforcement, codemaps, simplification,
review, and blueprint planning. Do not install the bundle:

- continuous learning writes durable inferred patterns and needs a separate
  governance decision;
- Red/Green may be trialled later in the implementation phase, where it can be
  compared with the existing `tdd` skill;
- simplify, code-review, and blueprint overlap current reviewers and planning;
- compass is useful only if onboarding/navigation becomes a measured bottleneck.

[`pixu1980/pi-coding-agent-extensions`](https://github.com/pixu1980/pi-coding-agent-extensions)
contains MCP, path-picker, reasoning, sessions, statusline, and web packages.
Select an individual package only for a demonstrated gap. Do not install the
monorepo as a convenience bundle: reasoning overlaps Pi plus
`pi-thinking-command`, statusline overlaps the optional TUI choices, and MCP
and web tools need their own authority review.

[`pi-cc-extensions`](https://github.com/minuque/pi-cc-extensions) and
[`pi-zentui`](https://github.com/lmilojevicc/pi-zentui) remain UI candidates as
described above; neither should become a workflow dependency.

### Effort controls

[`pi-effort`](https://github.com/ricardofrantz/pi-effort) provides `/effort`,
`/fast`, a shortcut, and footer state. It overlaps Pi's built-in thinking
levels and the installed `pi-thinking-command`. Hold it unless OpenAI priority
service-tier control becomes a repeated need; do not keep two commands for the
same reasoning control.

## Re-evaluation checklist

Before moving a candidate into `install.sh`:

1. Name the observed gap and show that Hospital/Pi cannot already close it.
2. Decide whether the package is additive or replaces an existing owner.
3. Inspect requested tools, filesystem/network access, persisted state, and
   transcript forwarding.
4. Pin an exact version; do not add an unversioned Git head to the baseline.
5. Test it alone, then with `pi-subagents` and Hospital in one real task.
6. Verify reload, compaction, owner questions, steering, stop, and uninstall.
7. Update this decision log and `install.sh` in the same commit.

The discovery catalogue is [pi.dev/packages](https://pi.dev/packages). Treat
catalogue presence as discovery only, not endorsement or compatibility proof.
