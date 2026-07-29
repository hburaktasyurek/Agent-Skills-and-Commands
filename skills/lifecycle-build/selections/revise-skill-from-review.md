# Selection record — revise-skill-from-review

Written **before** any `skills/revise-skill-from-review/SKILL.md` existed.
No method name appeared in the selection request.

## Eight-field input

```yaml
task: >
  Apply a closed purpose_fail remedy list to a skill draft under
  .skill-proposals only; verify each gap; make the smallest in-scope edits;
  leave re-review to a separate session; do not invent findings or ship.
audience: Agents in the skill-design authoring session and humans.
context: >
  Remedies come from an independent purpose-fail review. Write scope is the
  draft directory. The create loop continues with a later re-review cycle, so
  this stage is one measured change inside a repeating design loop — not a
  terminal one-off with no next cycle.
output_format: Per-remedy reconciliation summary and updated draft files when confirmed.
validation:
  checks:
    - Every remedy is confirmed, edited, pushed back, or blocked with reason
  evidence:
    - Diffs limited to .skill-proposals/<skill_name>/
human_review_stop:
  stop_conditions:
    - Stop when the closed list is reconciled or an item needs human input
  human_approval_required: true
  approval_actions:
    - ship skill to skills/
```

## Selection result

```yaml
contract:
  methodology: pdca
  method_fit:
    best_when: A workflow should improve through repeated measured cycles.
    avoid_when: The task is a one-off decision with no next cycle.
    reason: >
      Closed-list draft repair is one Plan-Do cycle whose Check is the later
      independent re-review and whose Act is keep, revise again, or ship.
      Avoid-when does not apply because the skill-design loop supplies the next
      cycle.
selection:
  methodology_name: PDCA
  reason: Owns bounded measured change inside a repeating review/revise loop.
  deferred_method: none
  method_ref: references/pdca.md
  quality_questions:
    - Was the change small enough to evaluate?
    - Was the result measured?
    - Is the next action based on evidence?
    - Did scope remain fixed during the run?
```

## Route

`methodology` → draft with methodology-skill-creator → `.skill-proposals/revise-skill-from-review/`
