---
name: to-spec
description: Turn current conversation context into a spec folder. Use after /grill-me or when enough context exists to plan a feature. Replaces shape-spec.
---

This skill converts conversation context into a spec folder ready for make-agent-do-things.
Do NOT jump to implementation — stop after saving the spec.

## Rules

- **Never use AskUserQuestion** — present everything as plain text in the conversation. When you need user input, state what you need and wait for their response.
- **Offer suggestions with explanations** — especially for module architecture; user may not know the answer
- **No dangerous assumptions** — if uncertain, present options with trade-offs, not a single guess
- **No file paths in plan.md** — file paths go in shape.md
- **Stop after saving** — do not begin implementation unless user explicitly asks
- **Every technical claim must cite source** — file:line from production code, not from summary docs or memory
- **Never invent details** — if the source doesn't have type hints, don't add them. If the source has 3 params, don't write 1. Copy exactly what exists.
- **Production source wins** — when summary docs, authority docs, and production code disagree, production declarations are the truth
- **State once, reference everywhere** — every policy, gate, or constraint is defined in exactly one place. Other mentions reference the definition. Never restate a rule in different words — restatements drift and create contradictions.

## Process

### Phase 1: Gather Context

Scan the conversation for:
- What we're building (feature scope)
- Who it's for (user/actor)
- Key constraints or requirements

If context is **sufficient** (e.g., /grill-me was run), proceed to Phase 2.

If context is **insufficient**, ask for the missing pieces in plain text. Do NOT re-ask questions already answered in the conversation.

### Phase 2: Deep Exploration

Explore the codebase to build a verified factual foundation. This phase produces the raw material for everything that follows.

1. Identify which files/modules are likely affected
2. **Read the actual production source files** — not summaries, not audit docs, not requirement docs. The function declarations, the class definitions, the config files.
3. For every technical fact you will use later (function signatures, class interfaces, config values, file structures), record:
   - The exact declaration as it appears in source
   - The file path and line number
4. **Trace all code paths for components in scope** — not just the happy path. Read function bodies, class methods, config handlers. Follow every branch: error handlers, retry paths, fallback paths, edge cases. A function called only on failure is still a dependency. A config value checked only in an edge case still matters. List every dependency from every branch.
5. Look for:
   - Existing patterns to follow or avoid
   - Load-time side effects (registrations, hooks, global state)
   - Deep module candidates (significant logic behind a simple interface)

**Source hierarchy** — when sources conflict:
1. Production source code (declarations, definitions)
2. Tests that pass (they verify real behavior)
3. Authority/audit docs (human-written, may lag)
4. Summary docs, requirement docs (most likely to drift)

Present findings and wait for confirmation:

```
I explored the codebase. Here's what I found:

**Files read:** [list with line ranges]

**Verified facts:**
- [fact — source:line]
- [fact — source:line]

**Source conflicts found:**
- [doc X says Y, but production source says Z — using Z]

**Assumptions I'm making:**
- [anything not verified — flagged explicitly]

Shall I proceed?
```

### Phase 3: Context-Aware Architecture

Design the module architecture by analyzing **how each artifact is used across all its consumers**, not what domain category it belongs to.

For every function, class, or component in scope:

1. **List every consumer and context that touches it** — callers, workflows, tests, external systems, other features
2. **Classify its role per context.** The same artifact often plays different roles depending on who's using it. Common role pairs:
   - **Modified vs. consumed** — we're changing this component, but another workflow depends on its current behavior
   - **Wrapped vs. called directly** — some callers go through our new abstraction, others still call the original
   - **Stubbed vs. exercised** — tests mock it as a dependency, but other tests run it for real
   - **Migrated vs. legacy** — new code uses the new version, old code still calls the old one
3. **Group by role pattern, not by category.** Two functions in the same domain (e.g., both "payment functions") may need to be in different modules if they play different roles across consumers.

The key question for each grouping decision: **"Does bundling these together force a consumer into a conflict — needing the original of one and the modified/wrapped/stubbed version of another?"** If yes, split.

Present the architecture and wait for confirmation:

```
Here's the proposed module architecture:

1. **ModuleName** — [what it contains] — [N] items
   - Role: [how consumers use it — e.g., "always a dependency, never modified directly"]
   - Interface: [the public contract]
   - Contains: [list with source citations]

2. **ModuleName** — ...
   - Role: [e.g., "modified in context A, consumed unchanged in context B"]
   - Split rationale: [why this can't be in the previous group]

**Context matrix:**
| Artifact | Context A    | Context B    | Context C     |
|----------|-------------|-------------|--------------|
| comp_x   | consumed    | consumed    | modified     |
| comp_y   | modified    | n/a         | consumed     |

⚠️ I'm uncertain about: [present 2 options with trade-offs]

Does this match your expectations?
```

### Phase 4: Draft Full Spec

Write the complete spec. Every technical detail must trace back to a verified fact from Phase 2.

**Mandatory checks while writing:**
- Every technical detail must exactly match the production source (param names, order, defaults — no invented types, no simplifications)
- Every count ("6 functions", "10 items") must match the actual list that follows it
- Every example must use the same names/values as the rules it illustrates
- When two mechanisms can control the same behavior, state which one wins and why
- When a decision was made, record the alternatives that were rejected and why
- **Single-source rule:** Every policy, gate, or constraint must be defined in exactly one place. All other mentions must reference that definition, not restate it in different words. Restating creates drift — the original says "baseline delta," a restatement says "all green," and now the spec contradicts itself.

**plan.md:**
```markdown
# [Feature Name] — Plan

## Problem Statement
[The problem, from the user's perspective]

## Solution
[The solution, from the user's perspective]

## Stakeholders
[Every actor affected by this feature — not just the direct user]

## User Stories
[Stories from EACH stakeholder — not just the primary persona]
1. As a ...

## Module Architecture
[Modules from Phase 3 with their interfaces and role classifications — no file paths]

## Tasks
### Task 1: [title]
[full task details with verification criterion]
```

**Stakeholder identification — do this before writing stories:**
Before writing any user stories, ask: "Who can this feature hurt if it's wrong?" Not just who uses it directly — who bears the consequences. A test infrastructure feature can hurt the business if mocks mask a real payment failure. A migration can hurt end users if it silently corrupts data.

List every stakeholder, then write stories from each one's perspective. The direct user (developer, admin) is obvious — the non-obvious stakeholders (business owner, end user, ops, downstream system) are where critical requirements hide.

Scale detail to feature size:
- User stories: 2-4 (small), 5-10 (medium), 10-20 (large)
- Stories must cover **every identified stakeholder**, not just the primary persona
- Tasks: as many as needed, each with a verification criterion

**shape.md:**
```markdown
# [Feature Name] — Shaping Notes

## Scope
[What we're building]

## Source Hierarchy
Production source wins. When [authority doc] conflicts with production, production is correct.
[List any specific conflicts found and how they were resolved]

## Technical Findings
[From codebase reading — file paths and line numbers required]
- [finding — source:line]

## Decisions
[Key decisions made, with rejected alternatives and reasoning]

## Context
- **Visuals:** None (or describe if provided)
- **Product alignment:** N/A (or note if agent-os/product/ was read)
```

**standards.md:** If `agent-os/standards/` exists, read `index.yml` and include full content of relevant standards.

**references.md:** Files and modules studied in Phase 2, with their relevance and key patterns observed.

**Do not save yet.** Phase 5 first.

### Phase 5: Self-Review

Before saving, review the entire spec against these failure patterns. Check each one explicitly. If any check fails, fix it before proceeding.

**1. Source fidelity**
- [ ] Every technical detail (signatures, interfaces, config values, schemas) matches the production source exactly
- [ ] No details added that don't exist in source (types, annotations, params, fields)
- [ ] No names renamed or simplified from what the source actually uses

**2. Role consistency**
- [ ] No module bundles artifacts that conflict — one consumer needs the original while another needs the modified/wrapped version
- [ ] The context matrix from Phase 3 is still accurate after writing tasks

**3. No invented details**
- [ ] Every technical claim traces to a file:line
- [ ] No "obvious" defaults, behaviors, or constraints that aren't actually in source

**4. Precedence clarity**
- [ ] When two sources disagree, the resolution is stated in shape.md
- [ ] When two mechanisms can control the same behavior, precedence is defined

**5. Internal consistency**
- [ ] Every count matches its list (e.g., "6 functions" → exactly 6 listed)
- [ ] Every example uses the same names/values as the corresponding rules
- [ ] Task references match module architecture descriptions

**6. Single-source / cross-file consistency**
Do this mechanically: for each policy, gate, or rule (e.g., "what does done mean?", "which source is authoritative?", "what's the completion criteria?"), search across ALL spec files for every place it's mentioned. Verify:
- [ ] Each policy/gate/rule is **defined** in exactly one place
- [ ] Every other mention **references** the definition, not restates it in different words
- [ ] No file contradicts another on technical details, counts, or decisions
- [ ] Completion/acceptance criteria in the summary, individual tasks, and shape.md all point to the same definition

**7. Architecture depth**
- [ ] Grouping is by usage pattern across consumers, not by domain category
- [ ] Each group has a clear "why these belong together" that isn't just "they're all [domain] things"

**8. Dependency completeness**
- [ ] For each component being modified or built, all code paths (including error/failure/edge-case branches) have been traced
- [ ] Every dependency from any branch is accounted for — handled, documented, or explicitly out of scope with justification

**9. Realistic preconditions**
- [ ] No task gates on conditions that may be impossible in the real codebase (e.g., "all tests must pass" in a legacy suite, "no existing usage" for a widely-used function)
- [ ] Gates use delta checks ("no new failures/regressions") rather than absolute checks unless a clean baseline is verified

**10. Stakeholder coverage**
- [ ] "Who can this hurt if it's wrong?" has been answered — not just the direct user
- [ ] User stories exist from every identified stakeholder's perspective
- [ ] Business-critical concerns (revenue, data integrity, compliance) are represented even when the feature seems purely technical

If any check fails, fix it inline, then re-verify. Only proceed to Phase 6 when all checks pass.

### Phase 6: Save

Generate the folder name:
```
YYYY-MM-DD-HHMM-{feature-slug}/
```

Create `agent-os/specs/{folder-name}/` (and `agent-os/specs/` if it doesn't exist) and write all files.

After saving, output exactly one line:

```
Spec saved: agent-os/specs/{folder-name}/
```

**STOP. Do not proceed to implementation unless the user explicitly asks.**
