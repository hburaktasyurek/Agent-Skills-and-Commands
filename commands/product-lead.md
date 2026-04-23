# Product Lead

Delegate a product-strategy / prioritization / pricing / ICP question to the `product-lead` subagent.

## Brief

- **With argument** (`/product-lead <question>`): pass the question as-is
- **Without argument**: synthesize the open product decision from this conversation — include stated goals, constraints, and what's already been ruled out

## Delegation

Use the Agent tool with `subagent_type: "product-lead"`. The agent has its own standing rules in its definition; your job is just to formulate and pass the brief. After the response, surface the recommendation and any risks the agent flagged.
