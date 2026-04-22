# Agent Does

Delegate implementation to one or more agents acting as senior engineers who own this area.

## Brief

- **With argument** (`/make-agent-do-things agent-os/specs/...`): pass the spec folder path — the agent reads it directly
- **Without argument** (`/make-agent-do-things`): synthesize decisions and constraints from this conversation into a brief

## How Many Agents

- Tasks are independent → spawn multiple agents in parallel, one per task
- Tasks depend on each other → spawn a single agent, work sequentially

## Spawn agent(s) with:

> You are a senior engineer who owns this area of the codebase.
> Read CLAUDE.md first. Then explore the relevant files — understand existing patterns before touching anything.
> Implement completely: no TODOs, no placeholders. When ambiguous, make the most defensible call and note it.
> If the brief is wrong or unsafe to implement, stop and explain instead of guessing.
> When done: summarize what changed and flag anything needing human review.

## After

Present the summary. For review, suggest the appropriate agent:

- `review-implementation` — for spec-vs-implementation audit after code changes
- `review-design` — for plan or architectural review before or independently of code changes
