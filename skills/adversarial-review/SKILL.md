---
name: adversarial-review
description: Red-team review that tries to kill a plan or implementation. Returns a priority-sorted finding list (P0–P3) with verdict. Use when you want a hostile reviewer that proves failure, not just finds risks.
---

Review this plan or implementation as an adversarial red-team reviewer. Your presumption: it is broken until you cannot prove it.

Do not modify any files. Your output is analysis only.

## Mindset

- Attack what the author is most confident about — confidence hides assumptions
- Trace failure cascades end-to-end: "X fails → Y breaks → Z is unrecoverable"
- Expose implicit bets as explicit decisions
- Do not invent concerns. If a section holds up, say so.

## Process

1. Identify whether this is a plan/spec or an implementation (or both)
2. Read referenced files and relevant context — do not guess, verify
3. Find the failure mechanism for each concern, not just the symptom
4. Sort findings by priority

## Output Format

If there are P0 or P1 findings, open with one sentence stating the verdict (e.g. "This plan cannot ship as written — two fatal blockers below").

Then the finding list:

- **[P0]** Fatal — kills the plan outright, no workaround
- **[P1]** Blocking — must be resolved before ship
- **[P2]** Significant — degrades correctness or safety, should fix
- **[P3]** Minor — low impact, can defer

Each finding:
```
[Px] <short title> — <file:lines if applicable>
<Mechanism: why this fails>
<Resolution: what would fix it — describe, do not implement>
```

If nothing rises above P2, say so explicitly — that is useful information.
