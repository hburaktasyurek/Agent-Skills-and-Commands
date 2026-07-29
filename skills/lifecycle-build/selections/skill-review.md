# Selection record — skill-review

Written **before** any `skills/skill-review/SKILL.md` existed.
No method name appeared in the selection request.

## Eight-field input

```yaml
task: >
  Judge whether a skill draft under .skill-proposals achieves its stated
  purpose; return purpose_pass or purpose_fail with a closed remedy list;
  edit nothing. Treat the draft's objective as the outcome under test and
  require reviewer-checkable success evidence, concrete boundaries, and a
  human approval gate that the executing agent does not self-approve.
audience: Agents in a separate review session and humans deciding whether to ship.
context: >
  Draft path and checklist purpose fields are supplied. Output is analysis only.
  Four observable purpose questions are the minimum acceptance frame for pass.
output_format: YAML verdict with per-question evidence and closed remedies on fail.
validation:
  checks:
    - All four purpose questions answered yes or no with quotes from the draft
  evidence:
    - purpose_pass or purpose_fail with closed remedy list on fail
human_review_stop:
  stop_conditions:
    - Stop after one verdict
  human_approval_required: true
  approval_actions:
    - ship skill to skills/
```

## Selection result

```yaml
contract:
  methodology: smart-goals
  method_fit:
    best_when: A goal must become measurable enough for an agent or person to finish.
    avoid_when: The work is still exploratory and no honest success condition can yet be named.
    reason: >
      The draft is judged as a goal-shaped agent instruction. The review must
      determine whether purpose, success evidence, scope, and stop boundaries
      are specific and measurable enough to finish — SMART owns that stage.
      Not exploratory once checklist purpose and success_signal exist.
selection:
  methodology_name: SMART Goals
  reason: Owns validating outcome measurability and finishability of the draft.
  deferred_method: none
  method_ref: references/smart-goals.md
  quality_questions:
    - Is the goal outcome-based?
    - Can a reviewer determine objectively when it is done?
    - Is the scope achievable in the intended run?
    - Is there a real boundary that stops the work?
```

## Route

`methodology` → draft with methodology-skill-creator → `.skill-proposals/skill-review/`
