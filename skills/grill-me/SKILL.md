---
name: grill-me
description: Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree. Use when user wants to stress-test a plan, get grilled on their design, or mentions "grill me".
---

Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one.

Ask the questions one at a time, in plain conversational prose — never through the AskUserQuestion tool. Present each question so I can grasp it at first glance — a question buried in a dense paragraph gets a worse answer, or none: lead with the question itself as one bolded sentence; beneath it, only what I need in order to answer — if it's a fork, the options and what each implies, as short bullets; the search trail compact at the end. The homework's depth belongs in the investigation, not in the question's length. Stop when every branch you've identified has been resolved — by an answered question, an agent-made decision, or an explicit deferral. Don't invent new branches to keep grilling.

## The homework standard

Nothing reaches me — not a recommendation, not a question — before you've tried to answer it from the artifacts yourself: read the relevant file, grep the codebase, check the spec, git history, and existing precedent. A recommendation without the homework is a guess wearing the label of a recommendation, and I will trust the label more than your confidence in it deserves. "Tried" has a completion standard: follow every mention of the disputed term or task ID across the corpus — grep it, don't settle for the files you happened to open. The answer is often five lines below where you stopped reading, or one grep away: if I have to tell you to check the artifacts and the answer was there all along, you spoke too early — and the worst form of that is a question answered by the file I told you to read first.

When artifacts appear to contradict each other, that is the start of the homework's second pass, not the end of it: gather all mentions, then resolve the conflict yourself by source precedence — documents I named as mandatory reading and whatever defines done (a done-when, a contract, a sizing rule) outrank derived specs, which outrank forward-references in sibling documents. Re-check the binding source before you speak: having read it once at the start doesn't mean you've extracted its answer to this question. When the evidence supports a conclusion, state it with citations and close the branch — don't ask me to confirm it. State the assumptions your conclusion rests on explicitly, but don't mistake an unchallenged assumption for a verified one: if a "go check that" would change your answer, you spoke too early.

## Question triage

With the homework done, ask only what the artifacts genuinely can't tell you. Every question that reaches me must carry its search trail: name where you looked — the files you read, the greps you ran, the binding sources you re-checked — and what each said or didn't say, ending with why that leaves the answer to me ("I checked X and Y; X is silent on this, Y covers the adjacent case but not this one — so I'm asking you"). If you can't write that trail honestly, the homework isn't done — go back. The trail is not decoration: it lets me audit at a glance whether you asked too early.

Then classify what remains:

- **Business/domain** (how the system works, what users need, what the rules are, real-world edge cases) → **Ask the user.** They know this better than the code does. If the evidence is unreachable (production traffic, stakeholder priorities, business intent), say so and ask without a preloaded recommendation.
- **Technical/implementation** (which pattern to use, where to put code, how to structure internals, API design) → **Decide it yourself.** State your decision with a one-line reason and move on.

If the user says "I don't know," diagnose which case applies:

- **Misrouted question** (you asked a technical question dressed as business) — try rephrasing as the business angle the user *can* answer. If no business angle exists, make the decision yourself per the rule above.
- **Genuine ignorance** (the data doesn't exist, or the user hasn't decided yet) — record it as an explicit unknown, name the assumption you'll proceed under, and move on. Don't keep pressing.

## Codebase consistency

Before making technical decisions, explore the codebase to find existing patterns — file organization, naming conventions, code structure. New code must read like the same person wrote the rest of the project.
