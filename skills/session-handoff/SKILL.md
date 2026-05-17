---
name: session-handoff
description: Generate a structured handoff document capturing current progress, open design questions, key decisions with rejected alternatives, and context needed to resume work. Use when ending a session, saying "continue later", "save progress", "session summary", or "pick up where I left off". Works across design sessions (grill-me, planning), code sessions, and mixed sessions; produces only a re-run instruction when context is too thin to classify.
allowed-tools: Bash, Write
---

# Session Handoff

The next session starts with amnesia — no memory of this conversation. This document is what survives. Auto-compaction is uncontrolled amnesia; this is the controlled version: you choose what carries forward. Keep the relevant points, cut the noise between them.

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
- Neither signal → **Unknown**: there is nothing meaningful to hand off. Write Status with `Phase: Unknown` and a single Resume Command: *"Re-run /session-handoff in the original session — current context is too thin to produce a handoff."* All other sections will be empty and are omitted by the content filter.

## Workflow

1. Read the conversation to determine phase (design / code / mixed / unknown).
2. Run `git status`. Combine the git result with Signal A using the **Phase combinations** table above to fix the final phase.
3. Extract decisions from the conversation using the Key Decisions rules below. If no decisions found, write `Decisions made: 0 — no explicit choices found; verify if design session is complete` in the Status section.
4. Identify open questions and blocked topics (design + mixed phases); include blocking reason where present.
5. If any section exceeds 7 items, group them under topic sub-headings so the list stays scannable.
6. Apply the two filters at the top of Output Sections (phase → content), then write each surviving section. Per-item check: *"Would a stranger who never saw this conversation understand this and take the right action?"*
7. Final check before output: (a) no excluded section present for this phase, (b) every `Because` comes from a source turn or carries `⚠️ RATIONALE NOT FOUND`, (c) Resume Command names a concrete action.
8. Save the document to `.handoff/YYYY-MM-DD-HHMM-session.md` in the current working directory (create the `.handoff/` directory if missing). Print the absolute path on the last line so the next session can `Read` it directly instead of being pasted in.

## Output Sections

Produce the document in this order. Two filters apply, in order:
1. **Phase filter** — omit sections marked as excluded for the current phase (e.g., What's Pending and Files Touched are hidden in design phase).
2. **Content filter** — of the sections that survive phase filtering, omit any that have no real content. Do not write "None," "N/A," or fill with phase-default text.

**Exception:** Resume Command is the only mandatory section — write it even if nothing else carries forward, so the next session has an entry point.

---

### Status
Content adapts to phase:

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

**Unknown phase:** `Phase: Unknown`. No other fields — the re-run note lives in Resume Command.

---

### Topics Resolved / What's Done
- **Design phase:** Label as *Topics Resolved* — list design topics that reached a decision.
- **Code phase:** Label as *What's Done* — list completed tasks.
- **Mixed phase:** Use both labels as separate sub-lists: *Topics Resolved* for design decisions reached, *What's Done* for completed code tasks.

---

### Topics Open / What's In Progress
Include if non-empty.
- **Design phase:** Label as *Topics Open* — discussion points raised but not resolved, **plus** exploratory framings, partial reasoning, and critical user statements that didn't crystallize into a decision but matter for resuming ("we noticed X but moved on").
- **Code phase:** Label as *What's In Progress* — include `file:line` references where relevant.
- **Mixed phase:** Use both labels as separate sub-lists: *Topics Open* for unresolved design threads, *What's In Progress* for in-flight code work.

**Tiebreaker vs Gotchas:** unresolved threads from the conversation belong here; Gotchas is for non-obvious behavior in code or process, not in dialogue.

---

### What's Pending
**Code and mixed phases only.** Hidden in design phase. List tasks not yet started; include blocking reason.

---

### Open Design Questions
Include if non-empty. List design topics **not yet explored** in this session — questions the conversation hasn't opened, branches the user hasn't reached, areas grill-me hasn't covered yet. In design phase, this section also absorbs the content that would otherwise go in What's Pending. Do not route unstarted code tasks here — those belong in What's Pending.

**Tiebreaker vs Topics Open:** if it was talked about and left hanging, it's *Topics Open*. If it wasn't talked about yet but should be, it's *Open Design Questions*.

---

### Key Decisions
Format each decision as:

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
List paths explicitly closed in this session.

```
- Do NOT [X] — [reason]
```

**What qualifies:** The user used a negation phrase directed at a specific option ("kullanmayalım", "stay away from X", "that's a non-starter"), or confirmed an agent's "should we avoid X?" question.

**Tiebreaker:** When ambiguous, prefer Gotchas. Do NOT requires an explicit closing statement.

**Counterexample:** "X seems risky" → Gotchas (a concern), not Do NOT (a decision).

---

### Gotchas for Next Session
Non-obvious behaviors and pre-existing traps discovered during the session — not decisions made, just observations.

---

### Resume Command
Mandatory — write it even when every other section is empty. One concrete action, not a branch name.

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
- Self-contained items only — no back-references ("as discussed above", "the approach we agreed on", "see earlier"), no pronouns pointing to a prior exchange. If an item requires context to make sense, embed that context inline.
- Keep it factual — describe state and decisions, don't infer motivation.
- Every line earns its tokens. No prose padding, no restating, no "let me explain" framing. If a sentence doesn't change what next-session does, cut it.
- Omit empty sections entirely. Do not write "None," "N/A," or fill with phase-default text. Better a short doc than a padded one.
