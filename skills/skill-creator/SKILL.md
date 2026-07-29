---
name: skill-creator
description: "Draft skill proposals under .skill-proposals or ship after purpose_pass. Use when A skill-path-selector path is methodology or procedural, or a human orders ship. Triggers: skill-creator; draft skill; ship skill."
---

# skill-creator

## Objective

Persist a methodology or procedural skill proposal only under .skill-proposals, or ship a purpose_pass draft into skills/ after explicit human approval

Produce the result for Agents running the skill-design loop and humans who approve ship.

## When to use

- Use when: A skill-path-selector path is methodology or procedural, or a human orders ship
- Do not use when: purpose judgment or path selection is still needed

## Invocation

- skill-creator
- draft skill
- ship skill

## Workflow

### Draft mode

1. Require skill-path-selector path methodology or procedural plus checklist fields including skill_summary.
2. Block if skills/<skill_name>/ or .skill-proposals/<skill_name>/ exists unless human replace is true.
3. For methodology: run methodology-skill-creator / loop-orchestrator render; write files only under .skill-proposals/<skill_name>/ (remap any skills/ target).
4. For procedural: write SKILL.md under .skill-proposals/<skill_name>/ using summary/when description formula without Apply Method.
5. Stop for skill-review. Do not self-approve purpose.

### Ship mode

1. Require explicit human ship and purpose_pass for this draft.
2. Copy .skill-proposals/<skill_name>/ to skills/<skill_name>/.
3. Update skills/INDEX.md and README.md Meta entries from the skill description.
4. Only then delete .skill-proposals/<skill_name>/. On any failure, stop and keep the draft.

## Validation

- Checks: Draft mode writes only under .skill-proposals/<skill_name>/; ship mode leaves skills/<skill_name>/ present and removes the draft only after copy and INDEX/README succeed
- Evidence to return: Surfaced result that demonstrates: Draft mode writes only under .skill-proposals/<skill_name>/; ship mode leaves skills/<skill_name>/ present and removes the draft only after copy and INDEX/README succeed

## Boundaries

- Do not select methodologies or judge purpose.
- Do not write skills/<name>/ in draft mode.
- Do not commit, push, or run npx skills install.
- Do not absorb skill-path-selector or skill-review jobs.

## Human review and stop

Human approval is required before: ship skill to skills/.
Stop after draft write pending review, or after ship completes, or when a ship step fails with draft preserved.
