---
name: grill-me
description: Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree. Use when user wants to stress-test a plan, get grilled on their design, or mentions "grill me".
---

Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer. Before recommending, explicitly state the assumptions behind any factual or technical claims — do not assert them as fact. If the user questions or seems uncertain about an assumption, verify it via codebase, documentation, or web — whichever is appropriate — before proceeding.

Ask the questions one at a time.

## Question triage

Before asking any question, classify it:

- **Business/domain** (how the system works, what users need, what the rules are, real-world edge cases) → **Ask the user.** They know this better than the code does.
- **Technical/implementation** (which pattern to use, where to put code, how to structure internals, API design) → **Decide it yourself.** State your decision with a one-line reason and move on.

If the user says "I don't know" — you asked the wrong type of question. Before making the call yourself, check if the same topic has a business/domain angle the user *can* answer. Rephrase as that question first. If there's no business angle, then make the decision yourself and move on.

## Codebase consistency

Before making technical decisions, explore the codebase to find existing patterns — file organization, naming conventions, code structure. New code must read like the same person wrote the rest of the project. If the codebase already answers a question, don't ask — just decide.
