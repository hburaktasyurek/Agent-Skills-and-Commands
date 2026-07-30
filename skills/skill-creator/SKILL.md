---
name: skill-creator
description: "Draft skill proposals under .skill-proposals or ship after purpose_pass. Create entry: if path or checklist is missing, invoke skill-path-selector first. Triggers: skill-creator; draft skill; ship skill."
---

# skill-creator

## Objective

Persist a methodology or procedural skill proposal only under .skill-proposals, or ship a purpose_pass draft into skills/ after explicit human approval and composition_ok (or an explicit human composition skip)

Produce the result for Agents running the skill-design loop and humans who approve ship.

## When to use

- Use when: drafting or shipping a skill (create entry), including when path or checklist is not ready yet; or a human orders ship
- Do not use when: the job is only purpose judgment (`skill-review`) or only path selection with no create/ship intent

## Invocation

- skill-creator
- draft skill
- ship skill

## Workflow

### Draft mode

1. If skill-path-selector path (methodology or procedural) or checklist fields including skill_summary are missing, invoke `skill-path-selector` first (it may invoke `skill-brief`). Do not invent checklist fields or path; do not absorb path selection. Once path is methodology or procedural and the checklist is complete, continue.
2. Block if skills/<skill_name>/ or .skill-proposals/<skill_name>/ exists unless human replace is true.
3. For methodology: run methodology-skill-creator / loop-orchestrator render; write files only under .skill-proposals/<skill_name>/ (remap any skills/ target).
4. For procedural: write SKILL.md under .skill-proposals/<skill_name>/ using summary/when description formula without Apply Method.
5. Stop for skill-review. Do not self-approve purpose.

### Ship mode

1. Require explicit human ship and purpose_pass for this draft.
2. Require composition evidence for the current draft:
   - A `composition_ok` verdict from `skill-composition` for this draft path, produced in **this ship attempt** against the **current** draft content. Any edit to the draft after the verdict invalidates it; re-run `skill-composition` with `proposal_path`.
   - Or an explicit human skip utterance naming this skill and giving a reason. Agent may not offer skip as default or invent a skip. Echo `composition_skip: { by: human, skill: <name>, reason: <reason> }` in the ship result.
   - Composition is an artifact prerequisite of ship mode (same class as purpose_pass), not an invoked skill.
3. Copy .skill-proposals/<skill_name>/ to skills/<skill_name>/.
4. Update skills/INDEX.md and README.md Meta entries from the skill description.
5. Only then delete .skill-proposals/<skill_name>/. On any failure, stop and keep the draft.

## Validation

- Checks: Missing draft path/checklist invokes `skill-path-selector` and writes no draft yet; draft mode writes only under .skill-proposals/<skill_name>/; ship mode requires composition_ok for the current draft path in this ship attempt (or a recorded composition_skip from an explicit human utterance), then leaves skills/<skill_name>/ present and removes the draft only after copy and INDEX/README succeed
- Evidence to return: Selector invoke proof when inputs were missing; draft path proof; for ship, the composition_ok YAML (subject = draft path) or composition_skip record, plus proof that skills/<skill_name>/ exists and the draft was removed only after copy and INDEX/README succeed

## Boundaries

- Do not select methodologies or judge purpose.
- Do not write skills/<name>/ in draft mode.
- Do not commit, push, or run npx skills install.
- Do not perform path selection or purpose judgment inside this skill; those jobs belong to `skill-path-selector` and `skill-review`. Invoking `skill-path-selector` for missing draft inputs is required, not a substitute for absorbing its judgment.
- Do not absorb `skill-review` jobs.

## Human review and stop

Human approval is required before: ship skill to skills/.
Stop after invoking `skill-path-selector` when awaiting its result for missing draft inputs; after draft write pending review; after ship completes; or when a ship step fails with draft preserved.
