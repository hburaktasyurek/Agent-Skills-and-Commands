# Selection record — skill-composition

Written **before** any `skills/skill-composition/SKILL.md` or `.skill-proposals/skill-composition/` draft.
No method name appeared in the selection request.

## Selector checklist

```yaml
purpose: >
  For one skill SKILL.md (catalog, proposal, or lifecycle fixture), extract
  invoke/forbid/require edges to catalog skill names and judge consistency,
  returning composition_ok, composition_fail with closed findings, or blocked;
  ignore manner-only constraints; do not edit files or build a full-repo graph.
audience: Agents checking composition before ship; humans reviewing findings.
when_to_use: >
  A single skill package (catalog, .skill-proposals draft, or lifecycle fixture)
  needs an invoke/forbid/require consistency check against the INDEX catalog.
when_not: >
  Purpose review (skill-review); which-skill routing (skill-router); designing a
  new skill path (skill-path-selector); full-repo graph encyclopedia; editing
  skills to add frontmatter.
success_signal: >
  Primary verdict is composition_ok|composition_fail|blocked; S1–S4 smokes match;
  findings closed on fail; no files edited by the checker.
boundaries: >
  Do not edit SKILL.md, INDEX, WORKFLOW, or install.
  Do not invent edges from WORKFLOW alone.
  Do not treat manner-only constraints as forbids.
  Extract only catalog-shaped skill name tokens.
  Edge targets must be INDEX ∩ skills/<name>/SKILL.md.
context: >
  Input exactly one of target | proposal_path | fixture_path. Subject may be
  non-INDEX for proposal/fixture; edge targets always catalog. Rules: unknown
  edge target → fail; invoke∩forbid → fail; skill-composition must not
  self-invoke.
output_format: >
  YAML with verdict, extracted edges, findings on fail, missing on blocked.
skill_name: skill-composition
skill_summary: >
  Check one skill's invoke/forbid/require edges against the catalog
invocation:
  - skill-composition
  - composition check
  - check skill deps
```

## methodology-selector contract

```yaml
contract:
  methodology: none
  task: >
    For one skill SKILL.md (catalog, proposal, or lifecycle fixture), extract
    invoke/forbid/require edges to catalog skill names and judge consistency,
    returning composition_ok, composition_fail with closed findings, or blocked;
    ignore manner-only constraints; do not edit files or build a full-repo graph.
  audience: Agents checking composition before ship; humans reviewing findings.
  context: >
    Input exactly one of target | proposal_path | fixture_path. Extraction and
    consistency rules are fixed in the skill-design plan; no catalog method owns
    "apply a closed rule checklist to extracted dependency tokens."
  output_format: YAML verdict with edges and findings.
  validation:
    checks:
      - Primary verdict is exactly one of composition_ok, composition_fail, blocked
      - Checker does not edit repository files
    evidence:
      - Returned YAML
  method_fit:
    best_when: Not applicable
    avoid_when: Not applicable
    reason: >
      Task is already narrow direct execution: extract tokens by fixed heuristics
      and apply closed consistency rules. Positive fit for decision-matrix (choose
      among options) and smart-goals (shape a goal) does not own this stage;
      negative fit / missing method → none.
  human_review_stop:
    stop_conditions:
      - One primary verdict returned
    human_approval_required: true
    approval_actions:
      - ship skill to skills/
selection:
  methodology_name: None
  reason: >
    Narrow procedural consistency gate; no catalog methodology owns extract-and-
    rule-check without stretching.
  deferred_method: none
  method_ref: none
  quality_questions: []
```

## skill-path-selector path

`procedural` — checklist complete, no collision, single responsibility, honest
`none` with narrow procedure rationale (not hybrid).
