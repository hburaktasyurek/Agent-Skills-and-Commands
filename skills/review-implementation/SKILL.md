---
name: review-implementation
description: "Review an implemented change against a named specification before opening a PR. Use when the user asks for spec-compliance, implementation-vs-spec, acceptance-criteria, or pre-PR implementation review. Produce an evidence-backed Ready for PR decision without editing project files. Do not use for an opened-PR merge gate."
---

# Review Implementation

Audit the implementation against its named specification. Find concrete gaps;
do not reward a report merely for looking complete.

## Boundaries

- Read only. Do not modify project files, memory files, or review inputs.
- Require an identifiable specification and implementation surface: an explicit
  path/reference, conversation artifact, or unambiguous current-branch change.
  If either side cannot be resolved, report what is missing and stop.
- Use repository instructions and architecture documents as evidence. Do not
  assume a framework, tenancy model, payment provider, or project convention.
- This is a pre-PR spec-compliance review. Use the opened-PR merge-gate skill
  when the task is to decide whether an existing pull request can merge. This
  receipt is required for the first named-spec implementation before its PR is
  opened; it is not a recurring correction-loop gate after that PR exists.

## Review

1. Identify the exact spec and implementation basis. Record paths or revision
   bounds so the result can be reproduced. For repository work, include content
   hashes for every named spec file, the implementation `HEAD`, and a
   fingerprint covering staged and unstaged diffs plus the relevant untracked
   inventory. Use equivalent immutable identifiers when Git is unavailable.
2. Turn every normative requirement and acceptance criterion into a checklist.
   Trace each item to implementation and tests as `met`, `not met`, or
   `insufficient evidence`.
3. Follow changed behavior through reachable entry points, state changes,
   integrations, failure paths, and user-visible outcomes. Check repository
   conventions only where they affect the named requirements or their safe
   operation.
4. Detect the stack from repository evidence such as manifests, imports,
   configuration, code, and project policies. When that evidence establishes a
   relevant framework or risk surface, read
   [references/conditional-checks.md](references/conditional-checks.md) and
   apply only the matching checks.
5. Inspect tests for the required behavior and material failure paths. A green
   suite is evidence only for what its assertions actually exercise.
   For a high- or critical-consequence universal or negative property, require
   one safe counterexample that varies a material carrier, data-flow path, or
   result independently of the enforcement representation. A scanner,
   inventory, or implementation and fixtures authored from the same model are
   correlated evidence.
6. Reconcile the checklist. Do not return Ready while a requirement is unmet,
   a material consequence is unexamined, or required evidence is missing.
   Treat a named spec that still binds a disproven or superseded mechanism,
   scope statement, or acceptance oracle as not ready even when current code
   appears to satisfy the governing outcome.

Bind the decision to the complete recorded basis. Any spec, implementation,
index, or relevant untracked-artifact change invalidates the receipt; rerun the
review rather than carrying `Ready for PR` forward.

Every finding must include:

- concrete file, line, diff, test, or missing-artifact evidence;
- the obligation and deepest task-owned root cause;
- why the current implementation, control, or proof mechanism cannot establish
  that obligation;
- the consequence surface and falsifiable outcome-level closure condition;
- independent proof obligations; and
- correction surface: `implementation-only`, `spec-and-implementation`,
  `evidence-only`, or `task-decision-required`.

Keep one task-owned root and its proof deficit in one finding. When a proven
implementation or contract defect already explains why current evidence is
insufficient, put the missing independent evidence under that finding's proof
obligations; do not emit a second `evidence-only` finding for the same root.
Reserve `evidence-only` for a material gap when no implementation or contract
defect has been proven.

The reviewer owns causal diagnosis and the proof contract; the implementer
owns solution design. Do not recommend an exact code shape, tool, parser,
algorithm, or file edit unless the named specification or other binding
authority leaves no alternative. In that exceptional case, cite the binding
clause and report a required mechanism rather than reviewer preference.

Use `implementation-only` when the approved contract remains sufficient and the
implementation must change. Use `spec-and-implementation` when current evidence
invalidates a named spec clause or proof mechanism and the contract must be
reconciled with the implementation; code need not change gratuitously when it
already satisfies the corrected contract. Use `evidence-only` when no defect is
proven but decision-critical proof is absent. Use
`task-decision-required` when controlling sources conflict or closure requires
an unmade product, compatibility, operational, destructive, or material scope
decision.

Do not invent defects. If the available artifacts cannot establish a claim,
label it `insufficient evidence`.

## Output

```markdown
## Spec Compliance Report

### Review basis
- Specification: ...
- Implementation: ...

### Artifact receipt
- Spec hashes: ...
- Implementation HEAD: ...
- Staged/unstaged/untracked fingerprint: ...
- Invalidation: any basis change requires re-review

### Requirement trace
- [met | not met | insufficient evidence] Requirement -> evidence

### Findings

[P0-P3] Finding
- Evidence: ...
- Obligation: ...
- Root cause: ...
- Incapable mechanism: ...
- Consequence surface: ...
- Required closure: ...
- Proof obligations: ...
- Correction surface: implementation-only | spec-and-implementation | evidence-only | task-decision-required

### Tests
- Proven coverage and missing material cases

### Overall status
**Ready for PR:** Yes | No | INCOMPLETE
```

Use `No` for a demonstrated defect or unmet requirement. Use `INCOMPLETE` when
the named spec, implementation basis, or decision-critical evidence is absent.
If there are no findings, say so; do not add filler.
