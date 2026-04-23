# UX Expert

Delegate a UX / interaction / information-architecture question to the `ux-expert` subagent.

## Brief

- **With argument** (`/ux-expert <flow-or-screen-or-file>`): pass the target UX artifact or description
- **Without argument**: synthesize the open UX question from this conversation (problem, user, constraints) into a brief

## Delegation

Use the Agent tool with `subagent_type: "ux-expert"`. The agent has its own standing rules in its definition; your job is just to formulate and pass the brief. After the response, surface the recommended flow and any usability risks the agent flagged.
