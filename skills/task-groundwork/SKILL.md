---
name: task-groundwork
description: Turn a roadmap task into a fully resolved decision tree, ready for spec writing. Reads the roadmap, codebase, git history and past specs to place the task in its phase context — what past tasks left behind, what future tasks expect — then resolves every decision branch with artifact evidence, escalating to the user only what artifacts genuinely can't answer. Use at task kickoff, whenever the user names a roadmap task to start ("start task 3.2", "görev 5'e başlayalım", "take the next roadmap item"), or wants a task grounded before running to-spec. For stress-testing a design that lives in the user's head rather than in artifacts, use grill-me instead.
---

# task-groundwork

A roadmap task arrives as a title and a few lines of detail. Between that and a spec sits a layer of unmade decisions: what the task actually means given what the code looks like today, what earlier tasks left behind, what later tasks will expect, and which choices must be made to serve the phase's goal. This skill does that groundwork — it interrogates the artifacts, not the user. The user is the escalation path, not the primary source.

**Position in the pipeline:** this runs at task kickoff, before to-spec. Its output is resolved conversation context — to-spec is what persists it into a spec folder. Do not write a briefing file. The one artifact this skill does write is a deferral note in the roadmap (see Deferral protocol), because the user navigates every task from the roadmap and a deferral recorded anywhere else is a deferral hidden.

**Sibling, not replacement, of grill-me:** grill-me extracts a design from the user's head by interview; this skill extracts it from the repo by investigation. Same destination — every branch of the decision tree resolved — opposite default direction.

## Rules that don't bend

Each of these is explained in context below; they are collected here because skipping any one of them silently corrupts the pipeline downstream:

1. **Write no code and edit no files.** The only write this skill ever performs is the deferral note in the roadmap, and only after explicit user approval.
2. **No deferral, no pull-forward, no roadmap correction without the user's explicit approval.** You may propose; you may not decide.
3. **Every question to the user carries its search trail.** No trail, no question — go back to the homework.
4. **Questions come one at a time, in plain prose — never through the AskUserQuestion tool** — and only after the investigation is complete.
5. **After every user answer, re-verify the affected branches before asking the next question.** The tree is live.

## The three failure modes this skill exists to prevent

1. **Context blindness.** Treating the task as an isolated work order — executing its literal text without asking how it serves the phase goal, what predecessors actually delivered, or what successors will build on. The fix is Phase 1: the purpose derivation is mandatory, not decorative.
2. **Scope leak.** Drifting into work that belongs to a task five or twenty steps ahead, because the agent never learned those tasks exist. Pulling future work forward is sometimes right — but only ever as an explicit, user-approved decision with a stated reason, never as drift.
3. **Silent deferral.** Investigation reveals the task differs from its roadmap description, and instead of resolving the conflict or asking, the agent shrugs it into "later." The deferral is recorded nowhere, rides invisibly through the next tasks, and surfaces only when twenty tasks of work turn out to be built on it. Deferral is not a decision this skill may make alone — see the protocol below.

## Phase 1 — Locate and orient

Find the roadmap. The user usually points at it ("read agent-os/roadmap.md", a README pointer, a path given at project start); large roadmaps may split into per-phase folders with an index file. Check the obvious candidates before asking — but if you genuinely cannot identify the roadmap or the task the user means, ask; guessing at the wrong task poisons everything downstream.

Then orient — answer each of these from artifacts before building any decision tree:

- **Purpose derivation:** what is the phase's goal, and how does this task serve it? Re-derive the task's purpose from the phase, don't just restate the task's title. A task whose derived purpose doesn't match its written description is a finding, not a nuisance.
- **The past:** what did prior tasks in this phase (and load-bearing earlier phases) actually deliver? Read the code and git history — verify, don't trust checkmarks. Note anything they were supposed to leave for this task but didn't.
- **The future:** what do upcoming tasks expect this task to produce? Read ahead in the roadmap far enough to know where this task's boundary is — that boundary is what makes scope leak detectable.
- **Open deferrals:** scan the roadmap for deferral notes from earlier tasks that touch this one. An inherited deferral becomes a branch of this task's tree.

If orientation reveals the task itself is stale — already done, obsolete, mis-scoped at roadmap-writing time — stop and surface that to the user with evidence and a proposed roadmap correction. Grounding a task nobody should do is the most expensive form of diligence.

## Phase 2 — Build and resolve the decision tree

From the derived purpose, enumerate the decisions standing between here and a spec: interfaces to define, data to shape, behaviors to pin down, edge cases the phase context makes real. Then resolve branches one by one under the homework standard:

**The homework standard.** Nothing reaches the user — not a recommendation, not a question — before you've tried to answer it from the artifacts: the relevant files read, the codebase grepped, the roadmap, past specs, git history and existing precedent checked. Follow every mention of a disputed term across the corpus — grep it, don't settle for the files you happened to open. When artifacts appear to contradict each other, resolve by source precedence: whatever defines done (the roadmap's phase goal, a contract, a done-when) outranks derived documents, which outrank forward-references in sibling documents. When the evidence supports a conclusion, state it with citations and close the branch — don't ask the user to confirm it.

**No root assumptions.** Every claim about the current state states what it rests on, and each of those supports was verified, not presumed. A technical decision may close a branch with a rationale only after the current-state premises behind that rationale have claim-matching evidence; the rationale never substitutes for that evidence. Label an inference as an inference and cite its verified premises. If a "go check that file" from the user could change your answer, the branch is not resolved yet — check first.

**Triage what the homework can't close:**
- **Technical/implementation** (which pattern, where code lives, internal structure) → decide it yourself, one-line reason, consistent with existing codebase patterns, move on.
- **Business/domain** (what users need, real-world rules, priorities) → still try the artifacts first — roadmap prose, past specs and commit messages encode more business intent than expected. Only when they're genuinely silent does the question go to the user.

**Scope contract.** As branches resolve, maintain an explicit boundary: in scope, out of scope, and — separately — anything you propose pulling forward from a future task, with the reason. A pull-forward is always presented to the user as a decision; it never happens implicitly.

## Phase 3 — Ask what remains

Bring questions only after the investigation is complete, one at a time, in plain conversational prose — never through the AskUserQuestion tool. Lead with the question itself as one bolded sentence; beneath it, only what's needed to answer — options and their implications as short bullets if it's a fork — and the search trail compact at the end: where you looked, what each source said or didn't, why that leaves the answer to the user. A question without an honest trail means the homework isn't done; go back.

**The tree is live, not a fixed list.** The user's answer routinely changes the tree — it names a file you missed, contradicts an assumption, reopens a closed branch. After every answer, re-run the homework on affected branches before asking the next question: follow the pointer, re-verify, prune or grow the tree accordingly. Never work through a stale question queue while the answers have been reshaping the ground under it.

If the user says "I don't know": rephrase toward a business angle they can answer; if none exists, make the call yourself as technical; if it's genuinely unknowable, it becomes a deferral candidate — which has its own protocol.

## Deferral protocol

A branch may be deferred only with the user's explicit approval, never by your own judgment. When you believe deferral is right, propose it: what the open point is, why it can't be resolved now, what it will block or risk later. If the user approves, record it in the roadmap next to the affected task or phase — a short note naming the open point and the task it was deferred from — so the next task's groundwork inherits it automatically. An unrecorded deferral is the failure mode this skill exists to kill; there is no category of "quietly unresolved."

## Done — and stop

The task is grounded when every identified branch is closed by evidence, by a stated technical decision, by a user answer, or by an approved-and-recorded deferral. Don't invent new branches to keep going.

Close with a summary the user can eyeball and to-spec can consume. Use this exact structure — to-spec reads it as its input, and a missing section is indistinguishable from "nothing found there":

```
## Purpose (derived from phase)
<the phase goal, quoted with its source line, and the task's purpose derived from it>

## Scope contract
In scope: ...
Out of scope: ... (name which future task owns each excluded item)
Pulled forward: ... (only with user approval; "none" otherwise)

## Resolved branches
<each decision: what was decided; claim-matching evidence for its current-state premises (file:line); and, for a technical choice, its one-line rationale>

## Findings reported to user
<roadmap/code contradictions, lying checkmarks, stale-task evidence — with citations>

## User decisions
<what they answered and which branches it changed; "none yet" if questions are pending>

## Deferrals
<approved deferrals and where in the roadmap each is recorded; proposals still awaiting approval>

## Status
<"ready for to-spec" — or exactly which open questions block it>
```

Then stop and tell the user the task is ready for to-spec. Do not invoke to-spec yourself — each pipeline step is run by the user.
