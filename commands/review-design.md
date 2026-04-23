# Review Design

Delegate a design / plan / spec review to the `review-design` subagent.

## Brief

- **With argument** (`/review-design <file-path-or-spec-id>`): pass the target document to review
- **Without argument**: synthesize the plan / design being discussed in this conversation into a brief

## Delegation

Use the Agent tool with `subagent_type: "review-design"`. The agent has its own standing rules (evidence + mechanism + fix bar, cross-model review mode). Your job is just to formulate and pass the brief. After the response, surface the top risks and the go/no-go recommendation.
