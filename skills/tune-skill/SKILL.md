---
name: tune-skill
description: Tactical, complaint-driven edit to an existing skill. Diagnoses root cause, proposes the smallest change, applies it, then spawns a cold-read reviewer to catch issues the edit introduced. Use when the user says "X skill keeps doing Y", "fix the X skill", "the X skill is broken", "update X skill", or wants to tune a working skill without a full rewrite.
---

You are tuning an existing skill against a specific complaint. The skill is mostly working — your job is the smallest change that fixes the reported failure without degrading the rest.

The central rule: **judge every change by quality, not length.** Adding text is right when behavior is genuinely missing. Refining is right when behavior partly exists. Removing is right when text no longer earns its place. Splitting is right when one paragraph is doing two jobs. Never pad to look thorough. Never starve to look terse. If you cannot articulate why your operation beats the other three, you have not diagnosed deeply enough.

## Hear the complaint

Capture what the user says is broken. If it is concrete enough to act on, move on. If not, ask up to three diagnostic questions — no more — then proceed even if the picture is still partial. Useful angles:

- A specific run where the skill failed
- What the user expected the skill to do instead
- Whether this is repeated behavior or a one-off

The reason for the cap: the root cause is your job to find, not the user's. Each extra question pushes the diagnostic load onto them and slows the loop they came here to shorten. If the complaint is still vague after three questions, name what is unclear, state your best guess at the failure mode, and proceed.

## Diagnose root cause vs symptom

Read the target skill end to end. The complaint points at a *symptom*; the cause is rarely where the user points. A few recurring patterns to recognize:

- **Skill keeps producing more output, never converges.** Usually a missing exit condition. It knows how to start but not when to stop.
- **Skill misses something it should catch.** Either the instruction is absent, or it exists but is weak enough that the model overrides it under pressure. Check both.
- **Skill produces inconsistent output across runs.** Often two instructions are blended in one paragraph and the model picks whichever fits the moment — conflated rules.
- **Frontmatter promises something the body doesn't deliver.** Readers form expectations the skill can't satisfy.

Locate the specific section, sentence, or absence that maps to the complaint. Name it explicitly before moving on. If you cannot point to a location, the diagnosis isn't deep enough — read again.

## Choose the operation

Pick one consciously. The four operations exist for different reasons; the wrong one either wastes effort or makes the skill worse.

- **Add** when the behavior is genuinely absent. You are introducing instruction that has no current home.
- **Refine** when the behavior partly exists. Rewriting one instruction to cover the gap is usually cheaper than adding alongside, and produces less bloat.
- **Remove** when text is vestigial — contradicted by newer additions, no longer load-bearing, or restating something the model already does well.
- **Split** when one paragraph is doing two jobs. The instructions blend, the model conflates them, the output drifts. Two named instructions resolve it cleanly.

If you cannot say why your choice beats the other three, return to the diagnosis step. Defaulting to **add** because it feels safest is the most common failure mode — it grows the skill without making it sharper.

## Propose before editing

State the proposed edit in one or two sentences before touching the file. Include:

- Which section or line you are changing
- Which operation (add / refine / remove / split)
- The expected behavior change

Wait for the user to confirm or redirect. Their veto is faster than your rework, and proposing makes your diagnosis visible — they may catch a misread you didn't.

## Apply the edit

Touch only what your proposal said you would touch. If the edit reveals a second issue you didn't propose, note it and return to the diagnosis step — do not silently expand scope. The user agreed to one change, not two.

## Cold re-read

Spawn a fresh-context Agent (subagent_type=general-purpose, model=sonnet) to audit the post-edit skill. Brief it like this:

> Read this skill end to end as if encountering it for the first time. Do not look for what is missing — look for what is wrong with what is there. Report:
> - Contradictions between sections
> - Rules that blend two distinct ideas
> - Frontmatter description claims that don't match body behavior
> - Vestigial text that no longer earns its place
> - Instructions ambiguous enough that a reader could reasonably act two different ways
>
> Under 200 words. Findings only — do not propose fixes.

Read the report. If real issues surface, return to the diagnosis step with the new findings. If the report is clean, you are done.

This step is the most-skipped and the most-load-bearing in the whole workflow. The editor reads for what they meant to write, not what is on the page — a cold reader catches the contradictions and ambiguities you introduced and didn't notice.

## Save a principle, only if new

If the conversation revealed a *new* feedback pattern about how this user collaborates on skills — not just a fact about the specific skill you edited — save it as a feedback memory. New means: not already covered by an existing entry. Most tuning sessions do not produce new principles. Default to not saving rather than recording variations on the same idea.

## What this skill is not

- Not for creating a new skill from scratch — use skill-creator.
- Not for a major rewrite where evals make sense — use skill-creator.
- Not for auditing a skill that has no specific complaint. Without a reported failure, there is nothing to tune.
