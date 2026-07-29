---
name: methodology-skill-creator
description: Create one focused, task-scoped methodology SKILL.md from a completed methodology-selector contract. Use when any method in the canonical twelve-method manifest should become reusable agent instructions for a defined task and audience. Preserves the shared eight fields, reads the selected canonical reference, and does not select methods, engineer loop goals, judge readiness, invoke the existing general skill-creator, or create general-purpose skills.
---

# Methodology Skill Creator

Turn one selected method and its canonical eight-field contract into one
reviewable methodology skill. This is not a general skill creator.

## Installed dependency

The renderer imports the manifest and selected method reference from the
sibling `methodology-selector` skill. Confirm that both skills are installed
under the same skills root. If the sibling is missing, stop and report the
required pair; do not copy or recreate the canonical method.

## Preconditions

Read [references/creator-contract.md](references/creator-contract.md).

- methodology-selector has returned a manifest methodology, not `none`;
- the canonical contract contains all eight shared fields;
- `selection.method_ref` matches the selected methodology;
- the caller supplies a new lowercase, hyphenated skill name that does not
  collide with an existing skill;
- one method and one task scope are requested.

Stop on a failed precondition. Do not choose a replacement method or broaden
the skill.

## Workflow

1. Preserve Task, Audience, Context, Output Format, Validation, Method Fit, and
   Human Review / Stop without changing their meaning.
2. Read only the canonical reference named by the selection.
3. Render one `SKILL.md`:

   ```bash
   node /absolute/path/to/methodology-skill-creator/scripts/render-methodology-skill.mjs /absolute/path/to/input.json
   ```

   Resolve the first path from the directory containing this `SKILL.md`. The
   agent prepares the JSON input; do not ask the human to hand-write it.

4. Check that the output reads as direct runtime instructions rather than an
   assignment report: Objective, Operating instructions, Required deliverable,
   When to use, Workflow, Execution checks, Evidence to return, and the original
   human-return boundary. It must also have repo-compatible frontmatter, one
   methodology, and the canonical quality questions.
   `character_count` is evidence for review, not a 4,000-character gate.
   Keep the skill focused, but allow it to exceed 4,000 characters when the
   task contract and canonical method content require that space.
5. Confirm the target directory still does not exist immediately before any
   authorized write.
6. Return the proposed file and evidence. Write it only when the caller asked
   for repository changes and the target is inside the current repository.

## Boundaries

- Do not use or recreate a general-purpose skill-creator workflow.
- Do not select a methodology or merge multiple methods.
- Do not invent method principles outside the canonical reference.
- Do not generate itself.
- Do not add the full methodology catalog in one run.
- Do not execute the task described by the generated skill.
- Do not judge loop readiness or approve the generated skill.
- Do not truncate or reject a skill merely because it exceeds 4,000
  characters; that hard limit belongs only to generated loop goals.

## Stop

Stop after one generated skill or one explicit validation failure. Human review
remains required wherever the canonical contract requires it.
