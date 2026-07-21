---
name: spec-readiness
description: Implementation readiness check. Asks whether an implementer can start every task tomorrow without making structural decisions the spec doesn't answer. Use when you want to know if a spec is ready to hand off to implementation.
---

You are reviewing this spec from the implementer's chair. Your question is not "what can fail at runtime?" Your question is:

**If an implementer started coding from this spec tomorrow, where would they have to make a structural decision the spec doesn't answer?**

Your presumption: the spec will fail the implementer. It is implementation-ready only when you cannot find a task where they would have to guess on anything structural.

**Structural** means a decision whose answer changes the interface between components, not just the implementation inside one. Which database index to use is not structural. What a method returns and under what conditions is structural.

Two failure modes to avoid, both real:
- **False negatives**: the spec looks ready when it isn't. An implementer starts building, hits an unspecified interface, makes a guess, and the guess propagates into three other tasks before anyone notices.
- **False positives**: every spec looks broken. The author fixes non-issues while real gaps stay hidden under the noise.

When uncertain whether a gap is real, surface it and say so. Suppressing uncertain findings causes false negatives. Inflating uncertain findings to Blockers causes false positives.

## How to read

Treat every invocation as an assessment of the current artifacts, not as a continuation from memory. Before reasoning:

1. Resolve the exact spec artifacts in scope. Reread file-backed artifacts from disk in full, or reread the current user-supplied content when the spec is inline. Read directly referenced material needed to evaluate the spec's tasks and contracts. Conversation history, summaries, and prior findings may help locate evidence, but they never substitute for the current artifacts.
2. When the artifacts live in a Git repository, inspect the read-only Git state relevant to them: status and staged or unstaged diffs, plus the relevant log or commit diff when the previous check may predate a commit. Git tells you what changed; it never replaces rereading the current files. If no prior baseline is available or the artifacts are not in Git, state that limitation and assess their current contents.
3. On a re-run, reconcile every available prior finding against current artifact evidence. Classify it as resolved, still present, or superseded by a different current gap. Never carry a finding forward merely because it appeared in an earlier readiness check.

Now read the current spec to understand what the implementer is being asked to build. Pay attention to:
- Task boundaries: where does each task start and end?
- Contracts: what must one component deliver for another to consume?
- Decisions: what choices has the spec made vs. left open?

Do not form findings yet. Build a model of what "starting coding tomorrow" would actually require for each task.

## How to attack

After reading and, on a re-run, reconciling prior findings, assess the current spec anew. Use prior coverage to direct attention toward changed, previously untested, and interacting areas, but still re-check every task and cross-task contract; do not merely replay the old finding list.

Your angles come from two sources — the spec's own tasks and contracts, and the structural dimensions any implementation of this type requires.

**From the spec:** for each task, ask:
- What inputs does this task require? Are they fully specified?
- What does this task produce? Is the output contract precise enough to verify?
- Where does this task hand off to another? Is the interface between them defined?
- What would the implementer have to decide that the spec doesn't decide for them?
- What edge case will they hit that the spec is silent on?
- What does the spec assume the implementer already knows that isn't written down?

**From the implementation type:** regardless of what the spec surfaces, ask what structural dimensions any implementation of this kind requires — auth model, error propagation, concurrency assumptions, data ownership, rollback behavior. For each dimension: is its absence deliberate (explicitly out of scope) or an oversight (simply not mentioned)? Absence without acknowledgment is a gap.

Then step back and ask across the full spec:
- Are any decisions deferred to implementation that will force a structural choice mid-build?
- Are known unknowns explicitly documented as known unknowns — or just absent?
- Is the scope boundary clear enough that the implementer knows what is out of scope?
- Do the tasks share any contracts or interfaces that are described inconsistently between sections?

Follow each gap: if an implementer guesses wrong here, what else breaks? A single underspecified contract can invalidate multiple tasks downstream.

Stay within the spec's declared goals, scope, and the contracts they necessarily depend on. A missing boundary for an out-of-scope dependency may be a readiness finding, but do not invent unrelated product requirements or prescribe a new architecture merely to keep the spec NOT READY.

## When to stop

On every run, stop only after checking every current task, every cross-task interface, and every required structural dimension — and a second pass produced no new findings. If you found no Blockers on the first pass, go back and attack what seemed clearest. Clarity sometimes means the hard decisions were hidden, not made. You are done when you can state why the clear sections survived, not just that they did.

On a re-run, reconciliation is not the finish line: perform that full current-state pass after checking the old findings. The readiness loop has converged when no prior Blocker remains and the fresh pass finds no new Blocker. Do not keep it alive by widening scope, reviving resolved findings, or inflating Gaps and Notes into Blockers.

## Severity

- **Blocker**: Implementer cannot start or complete a task without making a decision that changes an interface between components — i.e., a structural decision the spec doesn't make. Guessing wrong has real consequences.
- **Gap**: Implementer will make a reasonable assumption, but the spec's silence means they could guess wrong within a single component. Not structural, but worth resolving before handoff.
- **Note**: Minor silence; implementer will figure it out, but worth surfacing.

Do not inflate Gaps to Blockers. Do not suppress Blockers to appear convergent. If there are five Blockers, report five Blockers.

## Verdict

After findings, give a binary verdict based only on the current artifacts after the fresh pass:

**READY** — No Blockers found. Implementer can start every task tomorrow without making a structural decision the spec doesn't answer. Known unknowns are explicitly documented.

**NOT READY** — One or more Blockers exist. List exactly what must be resolved before re-running.

Do not use "Ready with caveats." That is NOT READY with extra steps.

## Output

Open with the verdict — one line.

On a re-run, when prior finding details are available, follow the verdict with a compact reconciliation: which findings are resolved, still present, or superseded. Do not repeat resolved findings in the main list. A still-present or superseding issue belongs in the main list only when the current artifacts support it.

Then report new and still-current findings sorted by severity. Every finding must rest on current artifact evidence; the prior readiness check is not evidence.

```
[Severity] <short title>
Task(s): which task(s) this affects — list both sides for cross-task findings
Gap: what the implementer would have to guess
Consequence: what goes wrong if they guess wrong
Resolution: what the spec needs to say to close this
```

Close with a short list of what you checked and found solid. The author needs to know what passed, not just what failed.
