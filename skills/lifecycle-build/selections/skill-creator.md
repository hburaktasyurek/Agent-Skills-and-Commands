# Selection record — skill-creator

Written **before** any `skills/skill-creator/SKILL.md` existed.
No method name appeared in the selection request.

Historical mapping: this package continues as `skill-draft-ship`. The old
package name is retained only in this creation record; no live
`skills/skill-creator/` package or alias remains.

## Eight-field input

```yaml
task: >
  Persist a methodology or procedural skill proposal only under
  .skill-proposals/<skill_name>/, or after explicit human ship and purpose_pass
  copy that draft into skills/<skill_name>/, update INDEX and README, then
  delete the draft directory last; never install globally or self-approve purpose.
audience: Agents running the skill-design loop and humans who approve ship.
context: >
  Draft mode remaps any inner creator path away from skills/. Ship mode is
  atomic copy-then-docs-then-delete-draft. Name collision blocks unless replace.
  This is controlled file routing and gates, not multi-option judgment (that
  belongs to skill-path-selector) and not purpose judgment (skill-review).
output_format: Draft directory path and render evidence, or ship confirmation with canonical path.
validation:
  checks:
    - Draft mode writes only under .skill-proposals/<skill_name>/
    - Ship mode leaves skills/<skill_name>/ present and draft removed only after success
  evidence:
    - Paths written and INDEX/README touch list on ship
human_review_stop:
  stop_conditions:
    - Stop after draft write pending review
    - Stop after ship completes or any ship step fails with draft preserved
  human_approval_required: true
  approval_actions:
    - ship skill to skills/
```

## Selection result

```yaml
contract:
  methodology: none
  method_fit:
    best_when: Not applicable
    avoid_when: Not applicable
    reason: >
      Already bounded direct execution of persist/ship file gates. No catalog
      thinking method owns path remapping and atomic ship. Not hybrid
      judgment work — selector and review own judgment stages.
selection:
  methodology_name: None
  reason: Bounded procedural harness; purpose-level none after honest selection.
  deferred_method: none
  method_ref: none
  quality_questions: []
```

## Route

`none` + narrow procedure → procedural draft → `.skill-proposals/skill-creator/`
(Harness exception recorded at selection time, not after hand-written prose.)
