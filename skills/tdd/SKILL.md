---
name: tdd
description: Use only when the user explicitly names tdd or an upstream task explicitly invokes it to implement a feature or bug fix test-first. Execute vertical red-green-refactor cycles against the repository's real contract; proceed without redundant approval when an authoritative brief is ready, and stop before writes only when a material behavior, scope, interface, or authority decision remains unresolved.
---

# Test-Driven Development

## Philosophy

**Core principle**: Tests should verify observable behavior through the most
stable contract boundary available, not incidental implementation details.
Code can change entirely; tests should not fail unless behavior changes.

**Good tests** are integration-style: they exercise real code paths through public APIs. They describe _what_ the system does, not _how_ it does it. A good test reads like a specification - "user can checkout with valid cart" tells you exactly what capability exists. These tests survive refactors because they don't care about internal structure.

**Bad tests** are coupled to implementation. They mock internal collaborators,
test private methods, or assert incidental call order. The warning sign: the
test breaks when behavior-preserving internals are renamed or rearranged.

Public responses are not always sufficient evidence. Persistence,
idempotency, concurrency, queue, and recovery contracts may require a fresh
process, independent connection, post-commit read, or durable-state assertion.
Use that evidence when it is part of the observable contract; do not substitute
a green response or mock interaction for the real invariant.

See [tests.md](tests.md) for examples and [mocking.md](mocking.md) for mocking guidelines.

## Language and tooling

The principles here — behavior over implementation, mock only at system boundaries, deep modules — are language-agnostic. The examples are TypeScript/Jest for illustration only. **Before writing any test, detect the project's language, test runner, assertion style, and mocking conventions, and use those.** Translate the principle, not the syntax: a Python project gets pytest idioms and fixtures, a PHP project gets PHPUnit conventions, a JS/TS project gets the runner already in use (Jest/Vitest/node:test). Don't carry idioms from one into a project that doesn't use them.

## Anti-Pattern: Horizontal Slices

**DO NOT write all tests first, then all implementation.** This is "horizontal slicing" - treating RED as "write all tests" and GREEN as "write all code."

This produces **crap tests**:

- Tests written in bulk test _imagined_ behavior, not _actual_ behavior
- You end up testing the _shape_ of things (data structures, function signatures) rather than user-facing behavior
- Tests become insensitive to real changes - they pass when behavior breaks, fail when behavior is fine
- You outrun your headlights, committing to test structure before understanding the implementation

**Correct approach**: Vertical slices via tracer bullets. One test → one implementation → repeat. Each test responds to what you learned from the previous cycle. Because you just wrote the code, you know exactly what behavior matters and how to verify it.

```
WRONG (horizontal):
  RED:   test1, test2, test3, test4, test5
  GREEN: impl1, impl2, impl3, impl4, impl5

RIGHT (vertical):
  RED→GREEN: test1→impl1
  RED→GREEN: test2→impl2
  RED→GREEN: test3→impl3
  ...
```

## Contract gate

Read repository instructions and the authoritative task, brief, spec, or review
findings before editing. Inspect enough implementation and tests to determine
whether the contract is ready.

- If behavior, scope, public interface, acceptance, and authority are already
  fixed, treat that as approval and begin the first RED cycle. Do not ask the
  user to reconfirm the plan or repeat decisions already present in artifacts.
- Resolve technical details from repository evidence when they do not change
  product behavior or scope.
- If artifacts conflict or a material behavior, scope, interface, priority, or
  authority decision remains, make no repository write. Report the evidence
  conflict and ask one specific blocking question.
- Do not turn missing ceremony—a ticket, roadmap, or separate test plan—into a
  blocker when the direct request is authoritative and complete.

List the smallest ordered behavior set needed for causal closure, including
failure modes and boundaries. Keep this as execution guidance; do not pause for
approval unless the contract gate found a genuine human decision.

## Workflow

### 1. First RED

For a feature, choose the thinnest end-to-end behavior in the approved
contract. For a bug, first reproduce the reported failure at the boundary that
proves the bug.

Write one focused test and run it. RED is valid only when it fails for the
expected missing or incorrect behavior. A syntax error, broken fixture,
unavailable dependency, or unrelated pre-existing failure is not useful RED;
repair the test setup or report the external blocker without changing product
code.

**You can't test everything — but "critical behavior" includes how the system
fails, not just the happy path.** Prioritize from the authoritative contract and
repository risk evidence. Treat error handling, invalid input, boundary
conditions, and failure modes as first-class behaviors. Ask the user only when
the contract gate found a genuine unresolved decision. Skip trivial
permutations, not distinct unhappy paths.

### 2. GREEN

Implement the smallest root-correct change that makes the focused behavior
pass without violating the known contract. “Minimal” does not mean patch only
the reported line while the same causal path remains open.

```
RED:   Write test for first behavior → test fails
GREEN: Write minimal code to pass → test passes
```

This is your tracer bullet - proves the path works end-to-end.

Run the focused test and confirm GREEN before continuing.

### 3. Incremental Loop

For each remaining behavior:

```
RED:   Write next test → fails
GREEN: Minimal code to pass → passes
```

Rules:

- One test at a time
- Only enough code to pass current test
- Don't anticipate future tests
- Keep tests focused on observable behavior
- Add the next test from evidence learned in the previous cycle
- Cover the task-owned success, failure, boundary, and same-root regression
  surface before claiming completion

### 4. Refactor

After all tests pass, look for [refactor candidates](refactoring.md):

- [ ] Extract duplication
- [ ] Deepen modules (move complexity behind simple interfaces)
- [ ] Apply SOLID principles where natural
- [ ] Consider what new code reveals about existing code
- [ ] Run tests after each refactor step

**Never refactor while RED.** Get to GREEN first.

After the focused cycles are green, run the relevant broader suite. Separate
unrelated pre-existing failures from regressions introduced by the task; do not
silently fix or hide unrelated failures.

## Checklist Per Cycle

```
[ ] Test describes behavior, not implementation
[ ] Test uses the stable observable boundary
[ ] Test would survive internal refactor
[ ] RED failed for the expected reason
[ ] Code is minimal for this test
[ ] No speculative features added
```
