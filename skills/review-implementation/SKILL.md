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
  when the task is to decide whether an existing pull request can merge.

## Review

1. Identify the exact spec and implementation basis. Record paths or revision
   bounds so the result can be reproduced.
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
6. Reconcile the checklist. Do not return Ready while a requirement is unmet,
   a material consequence is unexamined, or required evidence is missing.

Every finding must include:

- concrete file, line, diff, test, or missing-artifact evidence;
- the failure mechanism and consequence;
- the smallest adequate correction or the exact evidence needed.

Do not invent defects. If the available artifacts cannot establish a claim,
label it `insufficient evidence`.

## Output

```markdown
## Spec Compliance Report

### Review basis
- Specification: ...
- Implementation: ...

### Requirement trace
- [met | not met | insufficient evidence] Requirement -> evidence

### Findings
- [P0-P3] Finding -> mechanism/consequence -> correction or required evidence

### Tests
- Proven coverage and missing material cases

### Overall status
**Ready for PR:** Yes | No | INCOMPLETE
```

Use `No` for a demonstrated defect or unmet requirement. Use `INCOMPLETE` when
the named spec, implementation basis, or decision-critical evidence is absent.
If there are no findings, say so; do not add filler.
