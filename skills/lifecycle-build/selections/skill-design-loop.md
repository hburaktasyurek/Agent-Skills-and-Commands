# Selection record — skill-design-loop

Written **before** any `skills/skill-design-loop/SKILL.md` existed.
No methodology name appeared in the selection request.

## Selector checklist

```yaml
purpose: >
  Orchestrate one explicitly invoked repository skill-design task through
  preflight, bounded intake, path selection, and proposal drafting, then stop
  before review or ship with one typed terminal YAML result.
audience: >
  Codex, Cursor, and Claude agents designing skills in this repository, plus
  humans who review the resulting proposal.
when_to_use: >
  A human explicitly invokes the skill to turn a free-form skill idea or a
  partial or complete checklist into one reviewable proposal.
when_not: >
  Direct draft or ship from an already selected path; purpose review; review
  remediation; composition checking; post-ship tuning; implicit skill routing.
success_signal: >
  The run reads only repository sibling contracts, keeps child stops inside
  their subflows, writes at most one authorized proposal, and returns exactly
  draft_created, decompose, or blocked with the required stage trace.
boundaries: >
  Explicit invocation only. Resolve the current repository as source of truth;
  never fall back to globally installed sibling content. Ask at most eight
  field-scoped intake questions, one at a time. Never review, ship, install,
  commit, or push. Stop on decompose, blocked, or one completed draft.
context: >
  The repository already separates skill-brief intake, skill-path-selector
  path judgment, methodology-selector method fit, methodology-skill-creator
  rendering, and skill-draft-ship persistence. The new package coordinates
  those contracts without copying or absorbing their responsibilities.
output_format: >
  A discriminated YAML result for draft_created, decompose, or blocked,
  including entered stages, terminal stage, normalized checklist, applicable
  path data, and the next human or skill handoff.
skill_name: skill-design-loop
skill_summary: >
  Orchestrate repository skill intake, path selection, and proposal drafting
invocation:
  - skill-design-loop
replace: none
```

## methodology-selector contract

```yaml
contract:
  methodology: none
  task: >
    Orchestrate one explicitly invoked repository skill-design task through
    preflight, bounded intake, path selection, and proposal drafting, then stop
    before review or ship with one typed terminal YAML result.
  audience: >
    Codex, Cursor, and Claude agents designing skills in this repository, plus
    humans who review the resulting proposal.
  context: >
    Inputs, stages, child contracts, collision gates, terminal variants, and
    stop boundaries are fixed. The work is direct state routing and contract
    preservation; methodology choice remains owned by methodology-selector
    inside the path-selection subflow.
  output_format: >
    A discriminated YAML result for draft_created, decompose, or blocked.
  validation:
    checks:
      - Explicit invocation reaches intake, selection, and at most one draft
      - Global sibling content is never used as source or fallback
      - Decompose and blocked paths write no proposal
      - Review, composition, ship, and install remain outside the task
    evidence:
      - Static entry fixtures and self-test result
      - Codex and Cursor runtime acceptance observations
  method_fit:
    best_when: Not applicable
    avoid_when: Not applicable
    reason: >
      The task is a bounded procedural state machine. Decision Matrix already
      belongs to skill-path-selector, 5W2H already belongs to skill-brief, and
      no other catalog method owns the outer read-execute-resume routing.
  human_review_stop:
    stop_conditions:
      - One draft_created, decompose, or blocked result is returned
    human_approval_required: true
    approval_actions:
      - Replace an existing proposal or shipped skill
      - Ship a reviewed proposal
selection:
  methodology_name: None
  reason: >
    All routing decisions and branch contracts are predetermined; applying a
    second methodology would duplicate a child skill or stretch its fit.
  deferred_method: none
  method_ref: none
  quality_questions: []
```

## skill-path-selector result

```yaml
path: procedural
rationale: >
  The checklist is complete, the requested package has one orchestration
  responsibility, no name collision exists, and methodology-selector returned
  none because the work is already bounded direct execution.
procedural_rationale: >
  Implement the fixed preflight → intake → selection → draft state machine and
  preserve each sibling skill's existing judgment boundary.
```

Next: create `skills/skill-design-loop/` as the explicit procedural
orchestrator and stop its runtime flow before review or ship.
