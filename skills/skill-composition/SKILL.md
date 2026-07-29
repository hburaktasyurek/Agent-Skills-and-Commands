---
name: skill-composition
description: "Check one skill's invoke/forbid/require edges against the catalog. Use when a single skill package needs an invoke/forbid/require consistency check against the INDEX catalog. Triggers: skill-composition; composition check; check skill deps."
---

# skill-composition

## Objective

For one skill `SKILL.md` (catalog, `.skill-proposals` draft, or lifecycle fixture), extract invoke/forbid/require edges to catalog skill names and judge consistency. Return exactly one primary verdict: `composition_ok`, `composition_fail` with closed findings, or `blocked`. Ignore manner-only constraints. Do not edit files or build a full-repo graph.

## Input

Exactly one of:

- `target` — name listed in `skills/INDEX.md` with `skills/<name>/SKILL.md`
- `proposal_path` — `.skill-proposals/<name>/SKILL.md`
- `fixture_path` — `skills/lifecycle-build/fixtures/**/SKILL.md`

Empty, missing, or path outside those roots → `blocked`.
If `skills/INDEX.md` is missing or unreadable → `blocked`.

Subject may be non-INDEX for proposal/fixture. Every **edge target** must resolve as INDEX ∩ `skills/<name>/SKILL.md`.

## Extraction

Read only the subject `SKILL.md`. Extract only lowercase hyphenated catalog-shaped skill name tokens used as skill references. Ignore non-skill phrases.

| Edge | Include when text… | Exclude |
|---|---|---|
| `invokes` | tells the agent to call / run / invoke / use skill `S` as a step | mere mentions in “do not use when” without a call instruction; parenthetical capability of another skill (“it may use `S`”); handoff stops (“stop for `S`”, “pending `S`”) without instructing this agent to run `S` |
| `forbids` | must not call, run, invoke, absorb, or replace skill `S` | manner-only constraints (e.g. “do not call **bare** `grill-me`”) — do not treat as `forbids: grill-me` |
| `requires` | names skill `S` as a hard prerequisite skill this agent must have already completed or must run before proceeding | soft “may” / “optional”; requiring an *artifact/output* shaped by another skill (“require skill-path-selector path”) without requiring that skill to be run here |

Do not invent edges from `WORKFLOW.md` alone.

## Consistency rules

Any break → `composition_fail` with closed findings (id, rule, quote, remedy hint):

1. Every `invokes` / `forbids` / `requires` target exists in INDEX ∩ `skills/<name>/SKILL.md`
2. No name appears in both `invokes` and `forbids`
3. If subject package name is `skill-composition`, it must not `invokes: skill-composition`
4. Checker edits nothing

If all extracted edges pass → `composition_ok` (include the extracted edge lists as evidence).

## Required deliverable

YAML with `verdict`, extracted `invokes` / `forbids` / `requires`, `findings` on fail, `missing` on blocked.

## When to use

- Use when: a single skill package (catalog, draft proposal, or lifecycle fixture) needs an invoke/forbid/require consistency check against the INDEX catalog
- Do not use when: Purpose review (`skill-review`); which-skill routing (`skill-router`); designing a new skill path; building a full-repo composition encyclopedia; editing skills to add dependency frontmatter

## Invocation

- skill-composition
- composition check
- check skill deps

## Workflow

1. Resolve input to a single subject `SKILL.md` path or `blocked`.
2. Load catalog = INDEX-listed names that have `skills/<name>/SKILL.md`.
3. Extract edges per the table (manner-only excluded from forbids).
4. Apply consistency rules; emit `composition_ok` or `composition_fail` with F1.. findings.
5. Stop. Do not edit, ship, install, or claim purpose_pass.

## Validation

- Checks: Primary verdict is exactly one of composition_ok, composition_fail, blocked; no repository files edited by this skill
- Evidence: Returned YAML; for fail, each finding cites a quote and rule number
- Rules engine self-test: `node skills/skill-composition/scripts/self-test.mjs` covers consistency rules 1–3 on pre-extracted edge fixtures; rule 4 (checker edits nothing) is agent-enforced, not machine-checked; extraction from SKILL.md prose remains agent-judged

## Boundaries

- Do not edit SKILL.md, INDEX, README, WORKFLOW, or run `npx skills` install.
- Do not invent edges from WORKFLOW alone.
- Do not treat manner-only constraints as forbids.
- Do not absorb `skill-review` or `skill-router` jobs.
- Do not recommend or execute a skill chain.
- Stop after one verdict.

## Human review and stop

Human approval is required before: ship skill to skills/.

Stop after one primary verdict, or when blocked on missing input/catalog.
