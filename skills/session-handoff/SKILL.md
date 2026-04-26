---
name: session-handoff
description: Generate a structured handoff document capturing current progress, open design questions, key decisions with rejected alternatives, and context needed to resume work. Use when ending a session, saying "continue later", "save progress", "session summary", or "pick up where I left off". Works across design sessions (grill-me, planning) and code sessions.
---

# Session Handoff

Different from a wrap-up. A wrap-up is a checklist for *you*. A handoff is a document written for the *next session* — written for a stranger who has never seen this conversation.

## Phase Detection

Two independent signals determine session type:

**Signal A — Conversation (design indicator):**
- Current session contains a grill-me Q&A block, or the user has been discussing design, spec, or decisions.
- If invoked in a fresh session with no prior context: Signal A is absent.

**Signal B — Git:** Run `git status`. If changes exist → code phase confirmed. Git clean does *not* mean design phase (also true after push or stash). Git can only confirm code phase; it cannot declare design phase.

**Phase combinations:**
- Signal A only (conversation signal, git clean) → **Design phase**
- Signal B only (git changes, no conversation signal) → **Code phase**
- Both signals → **Mixed phase**
- Neither signal → **Unknown**: produce a minimal fallback document using git-only Status; add to Resume Command: *"Could not determine phase — re-run /session-handoff in the original session if this is a design handoff."*

## Workflow

1. Read the conversation to determine phase (design / code / mixed / unknown).
2. Run `git status` to confirm or upgrade to mixed. The two signals are independent — no conflict.
3. Extract decisions from the conversation using the Key Decisions rules below. If no decisions found, note `Decisions made: 0 — no explicit choices found; verify if design session is complete`.
4. Identify open questions and blocked topics (design + mixed phases); include blocking reason where present.
5. Exclude irrelevant sections for this phase (see Section Order below); group items by topic if any section exceeds 7 items.
6. Write each section. Per-item check: *"Would a stranger who never saw this conversation understand this and take the right action?"*
7. Final check before output: (a) no excluded section present for this phase, (b) every `Because` comes from a source turn or carries `⚠️ RATIONALE NOT FOUND`, (c) Resume Command names a concrete action.

## Output Sections

Produce the document in this order. Omit sections marked as excluded for the current phase.

---

### Status
Always included. Content adapts:

**Code phase:**
- Branch, commits this session, uncommitted changes, test status.

**Design phase:** Git data must not appear here.
- `Phase: Design (pre-code)`
- `Grill-me: completed / in-progress` — infer from conversation; use `unknown` if ambiguous.
- `Decisions made: N` (or `0 — no explicit choices found; verify if design session is complete`)
- `Open questions: N`

**Mixed phase:**
- `Phase: Mixed (design + code)`
- `Branch`, uncommitted changes (from git)
- `Grill-me: completed / in-progress / unknown`
- `Decisions made: N`
- `Open questions: N`

**Unknown phase:** Include git-only fields if available; add the re-run note.

---

### Topics Resolved / What's Done
Always included.
- **Design phase:** Label as *Topics Resolved* — list design topics that reached a decision.
- **Code phase:** Label as *What's Done* — list completed tasks.
- **Mixed phase:** Use both labels as separate sub-lists: *Topics Resolved* for design decisions reached, *What's Done* for completed code tasks.

---

### Topics Open / What's In Progress
Always included.
- **Design phase:** Label as *Topics Open* — list discussion points that were raised but not resolved.
- **Code phase:** Label as *What's In Progress* — include `file:line` references where relevant.

---

### What's Pending
**Code and mixed phases only.** Hidden in design phase. List tasks not yet started; include blocking reason. In design phase, this content goes into Open Design Questions instead.

---

### Open Design Questions
**Design and mixed phases.** Also include in code phase if open design decisions exist. List topics not yet explored in grill-me, unresolved branches, and any pending design topic with its blocking reason. This is where What's Pending content lives in design phase. Do not route unstarted code tasks here — those belong in What's Pending.

---

### Key Decisions
Always included. Format each decision as:

```
- Selected: [Z] / Rejected: [X] / Because: [rationale from conversation]
```

If rationale cannot be paraphrased from a specific conversation turn, it is mandatory to write:
```
  ⚠️ RATIONALE NOT FOUND — verify before proceeding
```
Generating a plausible-sounding rationale is not allowed.

**What counts as a decision:** Both of the following must be true:
1. The user stated an explicit preference (silence, changing topics, or "sure" / "makes sense" do not qualify).
2. The preference excluded a specific alternative.

**Examples:**
- ✓ "Hayır, Z olmalı çünkü X maintenance'ı zorlaştırır" → `Selected: Z / Rejected: X / Because: X complicates maintenance`
- ✓ "X'i denedik ama olmadı" → `Selected: [next approach] / Rejected: X / Because: ⚠️ RATIONALE NOT FOUND`
- ✗ "Tamam, mantıklı" / "Sure" / "Makes sense" → not a decision, do not extract

**Key Decisions + Do NOT overlap:** If a rejected option also carries explicit "never again" language, move it to Do NOT entirely. Leave `(see Do NOT)` in Key Decisions. Do not duplicate.

---

### Files Touched
**Code and mixed phases only.** Hidden in design phase.
```
- `path/to/file.ts` — [what changed]
```

---

### Do NOT
Always included. List paths explicitly closed in this session.

```
- Do NOT [X] — [reason]
```

**What qualifies:** The user used a negation phrase directed at a specific option ("kullanmayalım", "stay away from X", "that's a non-starter"), or confirmed an agent's "should we avoid X?" question.

**Tiebreaker:** When ambiguous, prefer Gotchas. Do NOT requires an explicit closing statement.

**Counterexample:** "X seems risky" → Gotchas (a concern), not Do NOT (a decision).

---

### Gotchas for Next Session
Always included. Non-obvious behaviors and pre-existing traps discovered during the session — not decisions made, just observations.

---

### Resume Command
Always included. One concrete action, not a branch name.

```
> [Verb phrase]. [1-sentence context if needed].
```

In mixed phase or when multiple paths are valid, list alternatives:
```
> Option A: Run /to-spec — all design decisions are captured above.
> Option B: Continue grill-me from [topic] — [N] open questions remain.
```

Examples:
- `> Run /to-spec. All decisions are captured above.`
- `> Continue grill-me from [topic]. Last answered question: [Q].`
- `> Implement [feature] in [file:line]. Approach is Z — see Key Decisions for why not X.`
- `> Continue implementation of [X]. Open tasks in What's Pending.`

## Guardrails

- Rationale, not just outcomes — the reason behind a decision is as important as the decision itself.
- If rationale cannot be sourced from the conversation, flag it with `⚠️ RATIONALE NOT FOUND`. Do not generate plausible-sounding reasoning.
- Self-contained items only — no back-references ("as discussed above", "the approach we agreed on", "see earlier"), no pronouns pointing to a prior exchange. If an item requires context to make sense, embed that context inline.
- Keep it factual — describe state and decisions, don't infer motivation.
