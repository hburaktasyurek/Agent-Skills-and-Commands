# Agent Does

Delegate implementation to one or more agents acting as senior engineers who own this area.

## Brief

- **With argument** (`/make-agent-do-things agent-os/specs/...`): pass the spec folder path — the agent reads it directly
- **Without argument** (`/make-agent-do-things`): synthesize decisions and constraints from this conversation into a brief

## How Many Agents

- Tasks are independent → spawn multiple agents in parallel, one per task
- Tasks depend on each other → spawn a single agent, work sequentially

## Which Subagent

Default: `subagent_type: "senior-implementer-sonnet"` — regardless of the current session model.

Override to `senior-implementer-opus` when the user explicitly asks for Opus in the conversation (e.g. "bunu Opus'a ver", "use Opus"). No flag/argument — natural language only.

Pass the brief (spec path or synthesized brief) as the Agent tool `prompt`. The subagent has its own standing senior-engineer rules in its definition; the brief you send is the task-specific layer on top.

## After

Present the summary. For review, suggest the appropriate agent:

- `review-implementation` — for spec-vs-implementation audit after code changes
- `review-design` — for plan or architectural review before or independently of code changes

If the sonnet subagent stopped early citing architectural complexity, suggest retrying with `senior-implementer-opus`.
