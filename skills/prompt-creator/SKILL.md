---
name: prompt-creator
description: Guide users through building a high-quality prompt by surfacing missing context, validating their approach, and applying Anthropic best practices. Use when user wants to write, build, or improve a prompt, mentions "create a prompt", "help me prompt", "write a prompt for me", or "prompt engineering".
---

# Prompt Creator

Build a production-quality prompt by interviewing the user, surfacing blind spots they don't know exist, and applying Anthropic prompt engineering best practices. Output is a ready-to-use prompt.

**One question at a time. Never list all questions at once.**

## Phase 1: Goal

Ask: "What are you trying to accomplish? One sentence."

If vague, push once: "What specific output would make this successful?"

## Phase 2: Approach check

Before going deeper, assess whether the user's stated approach is the best one for the goal:

- If a clearly better approach exists, name it directly: "You're planning X. Y is more effective here because [reason]. Should we use Y instead?"
- If the approach is sound, confirm in one sentence and continue.

Do NOT ask the user to identify a better approach themselves — they often don't know one exists. The assessment is yours to make.

## Phase 3: Surface missing context

Probe for context the user has but forgot to include. Ask these one at a time, skipping any already answered:

1. "What background, situation, or constraints does Claude need that isn't obvious from what you've told me?"
2. "Who or what consumes the output — you directly, another system, an end user, a downstream process?"
3. "What should Claude avoid, or what hard constraints must it respect?"
4. "Have you seen a response that was almost right but missed something? What was missing?"

Stop probing once you have enough to write a complete prompt. Don't ask for the sake of asking.

## Phase 4: Output definition

Ask:
- "What should the output look like?" — format, structure, length (e.g., JSON, numbered list, prose, max 200 words)
- "What tone or voice?" — only if relevant; skip for technical, code, or data prompts

## Phase 5: Examples

If the task is pattern-based, stylistic, or subjective (classification, tone-matching, formatting, summarization):
Ask for one example of a good output, or a description of what a perfect result looks like.

Skip for tasks where examples add no value — clear procedural tasks, simple lookups, straightforward transforms.

## Phase 6: Assemble

Enter plan mode before writing complex prompts (multi-section, agentic, tool-use, chained tasks). For simple prompts, write directly.

Build the prompt using only the sections that add value — do not include a section just to fill the template:

**1. Role** — Specific expert identity. Include only when it materially improves output quality.
> "You are a senior Postgres engineer specializing in query optimization."
> Avoid generic roles like "You are a helpful assistant."

**2. Context** — Background, situation, constraints. Use `<context>` tags when multi-part.

**3. Task** — Verb-first, specific instruction. Eliminate vague words ("good", "proper", "appropriate", "relevant"). One coherent task per prompt — if the scope is too broad, split into a prompt chain.

**4. Format** — Explicit output structure and length. Never leave format implicit.

**5. Examples** — Wrap in `<example>` tags. Use multiple examples when the pattern has variance.

**6. Constraints** — What to avoid, edge cases to handle, failure modes to guard against.

Use XML tags (`<context>`, `<task>`, `<format>`, `<example>`, `<constraints>`) when the prompt has multiple sections. Plain prose is fine for simple, single-section prompts.

### Self-check before delivering

- Is the task verb-first and unambiguous?
- Does the prompt contain everything Claude needs that it cannot infer on its own?
- Is the output format stated explicitly?
- Are examples included for pattern/style tasks?
- Is scope bounded to one coherent task?

Deliver the finished prompt in a code block, then ask: "Does this match what you need, or should we adjust anything?"
