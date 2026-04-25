---
name: to-spec
description: Turn current conversation context into a spec folder. Use after /grill-me or when enough context exists to plan a feature. Replaces shape-spec.
---

This skill converts conversation context into a spec folder ready for make-agent-do-things.
Do NOT jump to implementation — stop after saving the spec.

## Guidelines

- **Always use AskUserQuestion** when asking the user anything
- **Offer suggestions with explanations** — especially for module architecture; user may not know the answer
- **No dangerous assumptions** — if uncertain, present options with trade-offs, not a single guess
- **No file paths in plan.md** — file paths go in shape.md
- **Stop after saving** — do not begin implementation unless user explicitly asks

## Process

### Step 1: Check Conversation Context

Scan the conversation for:
- What we're building (feature scope)
- Who it's for (user/actor)
- Key constraints or requirements

If context is **sufficient** (e.g., /grill-me was run), proceed to Step 2.

If context is **insufficient**, use AskUserQuestion to collect only the missing pieces:

```
Before I start, I need a few answers:

1. What are we building?
2. What's the expected outcome when it's done?
3. Any constraints I should know about?
```

Do NOT re-ask questions that were already answered in the conversation.

### Step 2: Explore the Codebase

Based on conversation context, autonomously explore the relevant codebase areas:

1. Identify which files/modules are likely affected
2. Read key files to understand current state
3. Specifically look for:
   - **Load-time side effects** — code executed at file scope (registrations, hooks, global state)
   - **Autoload limitations** — free function files may not be reachable by classmap; PSR-4 requires namespaced classes
   - **Existing patterns** — code to follow or avoid
   - **Deep module candidates** — components that encapsulate significant logic behind a simple, stable interface

### Step 3: Present Findings — Get Confirmation

Use AskUserQuestion:

```
I explored the codebase. Here's what I found:

**Files read:** [list]

**Technical findings:**
- [finding with file reference — e.g., "payment-functions.php has load-time hook registrations — unsafe to require in tests"]
- [finding — e.g., "functions/ files are free functions, classmap autoload won't reach them"]

**Assumptions I'm making:**
- [anything I'm assuming — flag explicitly]

Shall I proceed with this understanding?
```

### Step 4: Propose Module Architecture

Sketch major modules to build or modify. Look for deep module opportunities.

A **deep module** encapsulates significant logic behind a simple, rarely-changing interface that can be tested in isolation.

Use AskUserQuestion:

```
Here's the proposed module architecture:

1. **ModuleName** — [what it encapsulates] — interface: [e.g., "process(Input): Result"] — testable because [reason]
2. **ModuleName** — ...

⚠️ I'm uncertain about: [name the uncertainty — present 2 options with trade-offs instead of picking one]

Does this match your expectations?
```

If you don't know the right answer, say so and present options — don't pick one silently.

### Step 5: Determine Feature Slug

Derive the folder slug from the feature name:
- Lowercase, hyphens, max 40 chars
- Example: `user-comment-system`

Do not generate the timestamp yet — it will be added in Step 9 just before saving.

### Step 6: Draft User Stories

Scale story count to feature size:
- Small refactor / fix: 2-4 stories
- Medium feature: 5-10 stories
- Large feature: 10-20 stories

Format: `As a [actor], I want [feature], so that [benefit]`

Use AskUserQuestion to confirm:

```
Here are the user stories I've identified:

1. As a [actor], I want [feature], so that [benefit]
...

Add, remove, or adjust?
```

### Step 7: Present Plan Structure

Show task titles only — no details yet:

```
Here's the plan structure:

## Task 1: [title]
## Task 2: [title]
...

Does this structure look right?
```

### Step 8: Write Full Plan

After confirmation, write each task in full detail:
- Reference module names from Step 4 (not file paths)
- Specific, actionable steps
- Include a brief verification criterion per task

**Do not save anything yet.** Saving happens in Step 9.

### Step 9: Save Spec Files — Do This Immediately

Generate the final folder name now (not earlier):
```
YYYY-MM-DD-HHMM-{feature-slug}/
```
Use the current timestamp + the slug from Step 5.

Create `agent-os/specs/{folder-name}/` (and `agent-os/specs/` if it doesn't exist) and write all files before anything else.

**plan.md:**
```markdown
# [Feature Name] — Plan

## Problem Statement
[The problem, from the user's perspective]

## Solution
[The solution, from the user's perspective]

## User Stories
1. As a ...

## Module Architecture
[Modules from Step 4 with their interfaces — no file paths]

## Tasks
### Task 1: [title]
[full task details with verification criterion]
```

**shape.md:**
```markdown
# [Feature Name] — Shaping Notes

## Scope
[What we're building, from Step 1]

## Technical Findings
[From codebase reading — file paths are OK here]
- [finding — e.g., "core/includes/functions/payment-functions.php: load-time hook registrations"]

## Decisions
[Key decisions made during shaping]

## Context
- **Visuals:** None (or describe if provided)
- **Product alignment:** N/A (or note if agent-os/product/ was read)
```

**standards.md:** If `agent-os/standards/` exists, read `index.yml` and include full content of relevant standards.

**references.md:** Files and modules studied in Step 2, with their relevance and key patterns observed.

After all files are saved, output exactly one line:

```
Spec saved: agent-os/specs/{folder-name}/
```

**STOP. Do not proceed to implementation unless the user explicitly asks to continue.**
