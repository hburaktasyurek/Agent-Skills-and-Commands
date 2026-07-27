---
name: loop-orchestrator
description: Coordinate the modular methodology and loop-design skills without duplicating their logic. Use when a task must be routed through methodology-selector and then either goal-engineering plus loop-readiness-score, or methodology-skill-creator. Preserves the canonical eight-field contract, stops on none/blocked/supervised states, and never executes or self-approves the resulting work.
---

# Loop Orchestrator

Move one canonical contract between focused skills. Own sequencing and handoff
state only.

## Inputs

- `intent`: `loop-goal` or `methodology-skill`;
- Task, Audience, Context, Output Format, Validation, and Human Review / Stop;
- the control envelope and explicit applicability declarations when
  `intent: loop-goal`;
- `skill_name` when `intent: methodology-skill`.

Read [references/handoff-contract.md](references/handoff-contract.md).

## Routing

1. Invoke [methodology-selector](../methodology-selector/SKILL.md).
2. Preserve its canonical eight-field `contract` exactly.
3. If selection returns `none`, stop and return the missing fact or negative-fit
   evidence. Do not call another component.
4. Route by intent:

   - `loop-goal`: pass the canonical contract plus the caller's control envelope
     to [goal-engineering](../goal-engineering/SKILL.md), then pass both
     `goal_input` and `goal_result` to
     [loop-readiness-score](../loop-readiness-score/SKILL.md).
   - `methodology-skill`: pass the canonical contract, selection metadata, and
     requested name to
     [methodology-skill-creator](../methodology-skill-creator/SKILL.md).

5. Bind the readiness result to the exact goal input, rendered goal, answers,
   risk, and applicability envelope used by the checker.
6. Return both downstream artifacts, score and band, failed gates, the single
   recommended correction, and the next owner.

## Verdict handling

- `blocked`: stop; route the single recommended correction to the component or
  human that owns the missing field.
- `supervised`: stop; return the incomplete supervision gate to a human.
- `ready`: return the prepared goal and evidence. `ready` is not execution
  permission.
- generated methodology skill: return it for independent and human review; do
  not run it or call loop-readiness-score, whose contract applies to rendered
  goals.

## Responsibility boundaries

- Selector owns method choice and negative-fit veto.
- Goal engineering owns rendering and character-limit evidence.
- Readiness owns gating and independently recounts the executable goal.
- Methodology skill creator owns one task-scoped SKILL.md proposal.
- This orchestrator owns only order, faithful transport, and stop routing.

Do not restate method rules, render goals, recalculate readiness, repair a
downstream artifact, execute the task, schedule a loop, or approve an action.

## Stop

Stop after one terminal handoff: `none`, `blocked`, `supervised`, `ready`, or
one generated methodology skill awaiting review.
