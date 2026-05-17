---
name: to-spec
description: Turn conversation context into a production-ready spec folder — the last structured step before implementation. Use this skill whenever the user says "to-spec", "/to-spec", "write the spec", "create a spec folder", "spec it out", or any variation of "turn this into a spec". Also trigger when the user has finished a design discussion and says something like "let's write this up" or "I'm ready to hand this off". The skill reads the project codebase to back every claim with source evidence, cross-checks all sections for contradictions, writes a four-file spec folder, then stops — no implementation.
---

# to-spec

Turns conversation context into a spec folder that an implementer can build from without ambiguity, and that you can review in minutes for correctness.

**The #1 failure mode this skill guards against: claims in different sections that contradict each other.** Every factual claim in the spec must be anchored to a production source file. No confidence without verification.

**Scope boundary:** This skill stops after saving the spec folder. It does not proceed into implementation.

---

## Output: the spec folder

```
agent-os/specs/YYYY-MM-DD-HHMM-<slug>/
├── shape.md       — What we're building: interfaces, data flow, key types
├── plan.md        — Acceptance criteria + ordered implementation tasks
├── references.md  — Source evidence: every file examined, facts extracted
└── standards.md   — Codebase patterns that must be followed
```

Derive the folder name from the conversation: date+time now, plus a short kebab-case slug describing the task (e.g. `2026-05-09-1600-phase-3-10-fixture-loader`). Confirm the slug with the user if it's not obvious from context.

---

## Workflow

### Phase 1 — Orient

Extract from the conversation:
- What is being built (one sentence)
- Which files or subsystems are involved
- Any constraints, interfaces, or patterns already discussed
- The task name / slug for the folder

**Before proceeding, scan the conversation for open questions** — anything raised but never answered, decisions deferred without a stated assumption, or explicit "TBD" markers. List them and stop. A spec written around an unresolved question doesn't resolve it; it hides it. Resume only when each item is either answered by the user or explicitly deferred with a written assumption that will appear in the spec.

If the target path differs from `agent-os/specs/`, ask the user before proceeding.

### Phase 2 — Evidence gathering (do not skip)

Phase 2 is not where you verify facts you already wrote down. It is where those facts come from. Phase 1's conversation tells you what's in scope; the codebase tells you what's true. Walk the codebase first, let the facts emerge from what it actually says, then write them down.

**Default posture: reader, not decider.** Most of what feels like a decision is already answered somewhere in the repo — in the tests that exercise it, the code that implements it, the migrations that shaped it, the configs that wire it. If you find yourself reaching for "we should use X," stop and grep first. A real decision is what's left after the codebase has been read and shown silent.

```
grep -rn "ClassName\|functionName\|pattern" src/
cat path/to/relevant/file.php | head -80
```

Build a **claim → source** table in working memory:

| Claim | File | Line(s) |
|---|---|---|
| `FixtureLoader` extends `BaseLoader` | `src/Loading/BaseLoader.php` | 12 |
| Jobs dispatched via `dispatch()` | `src/Jobs/ProcessJob.php` | 47 |

If a file you expected to find cannot be located, note it as **unverified** — never invent it.

**When docs and code disagree, code wins.** Comments, READMEs, and inline documentation describe intent; the running code describes reality. If you find a discrepancy, use the code as the fact and add a note in `references.md` flagging the doc as stale.

### Phase 3 — Draft the four files

Write all four files before saving any of them. You need all content in scope to run the contradiction audit in Phase 4.

**Write directives, not options.** The implementer escalates on architectural ambiguity — any "could use X or Y" left in the spec becomes an interruption you'll have to handle anyway. Resolve every decision here: "use X" not "consider X or Y".

#### shape.md

```markdown
# Shape — [task name]

## What this builds
[1–2 sentences: the artifact, its role in the system]

## Key interfaces
[For each: signature, parameters, return type — sourced from production code]

## Data flow
[Input → transformation → output. Concrete types, not vague prose.]

## Design decisions
[Decision] — [Rationale] — [Source if driven by existing pattern]

## Out of scope
[Explicit list of what this task does NOT include]
```

#### plan.md

```markdown
# Plan — [task name]

## Acceptance criteria
- [ ] [Concrete, testable criterion]
- [ ] [Each criterion maps to something in shape.md]

## Implementation tasks
[Ordered list. Each task must be specific enough to code from.]

1. [Task] — [file to create or modify] — [what changes]
2. ...

## Dependencies
[Any task that must complete before another can start]

## Known risks
[Anything uncertain — flag it, don't bury it]
```

#### references.md

```markdown
# References — [task name]

## Source files examined

### [path/to/file.php]
- **Purpose:** [what this file does]
- **Relevant to this spec:** [why it was read]
- **Key facts:** [bullet list of facts extracted, each with line number]

### [path/to/another/file.php]
...

## Unverified claims
[Any claim that could not be backed by a source file — must be explicitly listed here]
```

#### standards.md

```markdown
# Standards — [task name]

## Naming conventions
[Pattern] — [Example from codebase] — [Source file:line]

## Structural patterns
[Pattern this implementation must follow] — [Example] — [Source]

## Anti-patterns (do not do this)
[What to avoid] — [Why] — [Where the correct pattern lives instead]

## Test conventions
[How tests are structured in this project] — [Example test file]
```

### Phase 4 — Contradiction audit (mandatory before saving)

Extract every **atomic claim** from all four draft files and check cross-section consistency.

Run these checks explicitly:

1. **Interface consistency** — Does every function signature in `plan.md` match `shape.md`? Does every type in `shape.md` match what's verified in `references.md`?
2. **Scope consistency** — Do the acceptance criteria in `plan.md` stay within the "What this builds" in `shape.md`? Does anything in `plan.md` contradict the "Out of scope" list?
3. **Standards consistency** — Do the implementation tasks in `plan.md` follow the patterns in `standards.md`?
4. **Evidence coverage** — Is every factual claim in `shape.md` and `plan.md` traceable to a source in `references.md`? If not, either verify it now or move it to the "Unverified claims" section.

Fix all contradictions found. If a contradiction cannot be resolved from the codebase alone, surface it explicitly in `references.md → Unverified claims` and flag it in the relevant section with `⚠️ UNVERIFIED`.

Do not proceed to Phase 5 with unresolved contradictions hidden inside the prose.

### Phase 5 — Save and stop

```bash
mkdir -p agent-os/specs/YYYY-MM-DD-HHMM-slug
# write shape.md, plan.md, references.md, standards.md
```

After saving:
- Confirm the folder path to the user
- List the four files with one-line summaries of what each contains
- State the unverified claim count (zero is the goal)
- **Stop. Do not begin implementation.**

---

## Guardrails

- **Never invent a file path, class name, or function signature.** If you haven't read it, you don't know it.
- **Unverified ≠ wrong — but it must be flagged.** Use `⚠️ UNVERIFIED` inline and list it in `references.md`.
- **Do not silently collapse contradictions.** Surface them; let the reviewer decide.
- **Conversation context is input, not source of truth.** Discussion may contain assumptions. The codebase is the source of truth.
- **One spec folder per task.** Do not mix multiple independent tasks into one spec.