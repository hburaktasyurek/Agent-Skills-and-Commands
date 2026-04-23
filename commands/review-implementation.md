# Review Implementation

Delegate a spec-vs-implementation audit to the `review-implementation` subagent.

## Brief

- **With argument** (`/review-implementation <spec-path-or-PR>`): pass the spec and/or the changed files to audit
- **Without argument**: identify the most recently implemented spec in this conversation (or on the current branch) and pass it

## Delegation

Use the Agent tool with `subagent_type: "review-implementation"`. The agent has its own standing rules in its definition; your job is just to formulate and pass the brief. After the response, list any gaps the agent found vs the spec and the suggested follow-ups.
