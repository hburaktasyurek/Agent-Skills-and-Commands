---
name: example-pass-draft
description: "Produce a one-page grounding note for a single named bug. Use when a reporter needs a purpose-framed summary before triage-issue."
---
# example-pass-draft
## Objective
Produce a one-page grounding note for a single named bug so a human can decide whether to run triage-issue.
## When to use
- Use when: A reporter needs a purpose-framed summary before triage-issue
- Do not use when: The bug already has an accepted root-cause write-up
## Workflow
1. Read the bug report and linked evidence.
2. State the user-visible failure in one sentence.
3. List open questions that block triage.
4. Stop and return the note for human review.
## Validation
- Checks: A one-page note exists that states the failure and open questions
- Evidence to return: The note body and the bug identifier
## Boundaries
- Do not run triage-issue or file a GitHub issue.
- Do not implement a fix.
- Do not approve merge or ship.
## Human review and stop
Human approval is required before: ship skill to skills/, filing issues, or implementation.
Stop when the note is returned or required bug evidence is missing.
