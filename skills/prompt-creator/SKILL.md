---
name: prompt-creator
description: Build high-quality Claude prompts step by step using an interview-driven approach grounded in Anthropic's official best practices. Use this skill whenever the user wants to create, write, improve, or refine a prompt for Claude — whether they say "write a prompt", "help me prompt Claude to do X", "create a system prompt", "I need a prompt for...", "how should I instruct Claude to...", "my prompt isn't working", or any similar phrasing. Also trigger when the user describes a task and asks how to instruct an AI to do it, or when they want to improve Claude's output quality by fixing the prompt. Trigger even if the user only has a vague idea — the interview will draw out the details.
---

# Prompt Creator

An interview-driven skill for building high-quality Claude prompts, grounded in Anthropic's official best practices for current models (Opus 4.x / Sonnet 4.x / Haiku 4.x).

## Core Approach

Work through three phases in order. **Ask one question at a time. Never list all questions upfront.** Stop probing the moment you have enough to write.

---

## Phase 1 — Goal & Approach Validation (1–3 questions max)

### Step 1: Understand the goal

Ask one question first:
> *What should the prompt make Claude do — and what does a good output look like?*

Wait for the answer before continuing.

### Step 2: Validate approach before going deep

Once the goal is clear, assess whether the user's stated approach (if they named one) is actually the best fit. If a clearly better approach exists, **name it directly** — don't ask the user to figure it out.

Common mismatches to check:

| User's stated approach | Better alternative if… |
|---|---|
| Add more instructions to make Claude think step-by-step | API-level `thinking: adaptive` + `effort: high` eliminates the need |
| Write a very long, detailed system prompt | XML-structured sections reduce length and improve parsing |
| Add few-shot examples for every case | Output format is simple enough; examples would just add tokens |
| Tell Claude to "be concise / don't use bullets" | A single short example outperforms paragraphs of format instructions |
| Add aggressive "MUST use this tool" language | Current models overtrigger on caps; plain language suffices |
| Chain of thought via instructions | Thinking mode handles this more reliably |
| "Just make it longer / shorter" | Explicit format section or verbosity instruction is more precise |

State your assessment in one sentence. Offer the better path, explain the reason in one sentence, and confirm before proceeding. Do not interrogate — offer your read and let them confirm.

### Step 3: Gather context (if not already clear)

If deployment context matters for section choices, ask one question:
> *Where will this run — Claude.ai chat, API system prompt, or Claude Code — and which model?*

---

## Phase 2 — Targeted Interview

With goal and approach confirmed, interview for details needed to build each section. **Use the Decision Matrix (below) to know which sections will be in the final prompt — only ask about those.**

Rules:
- One question per turn
- Stop asking when you have enough to write; do not probe for information that won't change the output
- If the user's answer makes a previously planned section unnecessary, drop it silently
- If an answer reveals a new required section, add it

---

## Phase 3 — Assembly

Apply the Decision Matrix to select sections, then write the prompt. Before writing any specialized section (tool use, agentic, thinking, formatting), read `references/best-practices-snippets.md` and pull the relevant ready-to-use snippet rather than writing from scratch.

**Present the finished prompt in a code block.**

Follow it with:
1. One-sentence rationale for each included section
2. Sections explicitly skipped and why
3. One concrete thing to test first (e.g., "test with an edge-case input that has no clear answer")

Offer to iterate.

---

## Decision Matrix

Err on the side of omission — every unnecessary section adds noise and token cost.

| Section | Include when | Skip when |
|---|---|---|
| **Role / Persona** | Task has a clear domain (coding, legal, medical, creative) or tone matters | General assistant tasks; conversational prompts |
| **Context / Background** | Claude needs facts it can't infer: company rules, custom terminology, codebase details | Widely known domains; facts are in the input |
| **Instructions** | Always — this is the core | Never skip |
| **XML Structure** | Prompt mixes 3+ content types (instructions + examples + variable input), or input is a dynamic template | Simple single-purpose prompts |
| **Few-Shot Examples** | Output format is nuanced, tone must be specific, or edge cases are likely to trip Claude | Format is simple/self-evident; use 3–5 examples or none — 1–2 rarely help |
| **Output Format / Verbosity** | Specific length, structure, markdown behavior, or LaTeX use is required | Freeform output is fine |
| **Tool Use Guidance** | Prompt involves tool calls; need to tune proactivity, parallelism, or safety | No tools involved |
| **Thinking / Reasoning** | Complex multi-step reasoning, math, coding, ambiguous inference | Simple lookups; single-step tasks |
| **Agentic Patterns** | Multi-step autonomous task, state tracking, long-horizon work, subagent orchestration | Single-turn tasks |
| **Long Context Handling** | Input is 20k+ tokens or involves multiple documents | Typical-length inputs |

---

## Assembly Rules

1. **Section order:**
   - Long-context prompts: documents first, instructions/query last (up to 30% better performance)
   - Everything else: role → context → instructions → examples → format spec

2. **XML tags when mixing 3+ content types.** Wrap `<instructions>`, `<context>`, `<examples>`, `<input>` distinctly. Use consistent, descriptive tag names.

3. **Snippets over improvisation.** For tool use, agentic patterns, thinking, formatting, and frontend design — pull from `references/best-practices-snippets.md`. These are tested against current models.

4. **Positive framing.** State what Claude should do, not what it shouldn't:
   - ✓ "Write in flowing prose paragraphs"
   - ✗ "Don't use bullet points"

5. **Match prompt style to desired output style.** Markdown in the prompt → more markdown in output. Plain prose prompt → plain prose output.

6. **One example beats three paragraphs** for output format and tone. Prefer examples for nuanced formatting; prefer instructions for behavioral rules.

7. **Context behind instructions improves generalization.** "Never use ellipses — this text will be read by a TTS engine" outperforms "NEVER use ellipses."

8. **For Claude Opus 4.7 / Sonnet 4.6:** These models follow instructions more literally than older models. Be explicit about scope ("apply this to every section, not just the first"). Do not use aggressive caps-heavy language — current models overtrigger on it.

---

## Reference Files

Read before writing any specialized section:

- `references/best-practices-snippets.md` — Ready-to-use snippets for: tool use (proactive / conservative / parallel), thinking / reasoning, agentic patterns (autonomy, long-horizon, subagent orchestration, state tracking), output and formatting control, code review, frontend design, and anti-hallucination. Organized by Decision Matrix section.