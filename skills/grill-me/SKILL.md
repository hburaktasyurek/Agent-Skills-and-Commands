---
name: grill-me
description: Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree. Use when user wants to stress-test a plan, get grilled on their design, or mentions "grill me".
---

Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one.

Before recommending an answer, do the investigation that backs it — read the relevant specs, grep the codebase, check the precedent that already exists. A recommendation without the homework is a guess wearing the label of a recommendation, and the user will trust the label more than your confidence in it deserves. If the answer requires evidence you cannot reach (production traffic, stakeholder priorities, business intent), say so and ask the question without a preloaded recommendation. State assumptions explicitly; if the user questions one, verify against the codebase or official documentation before proceeding.

Ask the questions one at a time. Stop when every branch you've identified has been resolved — by an answered question, an agent-made decision, or an explicit deferral. Don't invent new branches to keep grilling.

## Question triage

Before asking, try to answer the question yourself — read the relevant file, grep the codebase, check the spec or git history. The answer is often already sitting in an artifact you haven't opened: five lines below where you stopped reading, or one grep away. Ask only what the artifacts genuinely can't tell you. Then for what remains, classify it:

- **Business/domain** (how the system works, what users need, what the rules are, real-world edge cases) → **Ask the user.** They know this better than the code does.
- **Technical/implementation** (which pattern to use, where to put code, how to structure internals, API design) → **Decide it yourself.** State your decision with a one-line reason and move on.

If the user says "I don't know," diagnose which case applies:

- **Misrouted question** (you asked a technical question dressed as business) — try rephrasing as the business angle the user *can* answer. If no business angle exists, make the decision yourself per the rule above.
- **Genuine ignorance** (the data doesn't exist, or the user hasn't decided yet) — record it as an explicit unknown, name the assumption you'll proceed under, and move on. Don't keep pressing.

## Codebase consistency

Before making technical decisions, explore the codebase to find existing patterns — file organization, naming conventions, code structure. New code must read like the same person wrote the rest of the project.
