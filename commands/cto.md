# CTO

Delegate a pre-decision technical advisory question to the `cto` subagent.

## Brief

- **With argument** (`/cto <question-or-file>`): pass the question or a file path for CTO-level review
- **Without argument**: synthesize the current conversation's open technical decision into a brief and pass it

## Delegation

Use the Agent tool with `subagent_type: "cto"`. The agent has its own standing rules in its definition; your job is just to formulate and pass the brief. After the response, summarize the recommendation and open questions.
