#!/usr/bin/env node

import assert from "node:assert/strict";
import {validateArtifact} from "./validate-pr-artifact.mjs";

const valid = `## What This PR Does

### The Problem

The same subscription could be processed twice and support could not see why.

### The Solution

This 3-commit change protects all four ways recovery begins and adds 6 checks.

## What Changes for the Team

- **For product/non-technical reviewers:** Automatic recovery can resume safely.
- **For developers:** All callers now use the durable idempotency contract.

---

## Technical Summary

| Metric | Verified scope |
|---|---|
| Commits | 3 commits from feature to main |
| Files changed | 7 files |
| Lines changed | 69 additions and 16 deletions |

## Risk and Scope Boundaries

This does not prove production activation.

## Test Plan

- [x] Focused checks: 6 passed.
- [ ] Full suite not run.
`;

assert.deepEqual(validateArtifact("Recovery: prevent duplicate processing", valid), []);

const collapsed = valid
  .replace("## What This PR Does", "## Business impact")
  .replace("## Technical Summary", "### Technical details and validation");
assert.ok(validateArtifact("Recovery: prevent duplicate processing", collapsed).some(
  (error) => error.includes("collapses the two-block format"),
));

const leaked = valid.replace(
  "This 3-commit change protects all four ways recovery begins and adds 6 checks.",
  "This 3-commit allowlist and egress change adds 6 checks.",
);
assert.ok(validateArtifact("Recovery: prevent duplicate processing", leaked).some(
  (error) => error.includes("mechanism language"),
));

const unmeasured = valid.replace(
  "This 3-commit change protects all four ways recovery begins and adds 6 checks.",
  "This change improves recovery.",
);
assert.ok(validateArtifact("Recovery: prevent duplicate processing", unmeasured).some(
  (error) => error.includes("no verified scale"),
));

assert.ok(validateArtifact("Enforce browser egress allowlist gates", valid).some(
  (error) => error.includes("internal mechanism"),
));

console.log("pr-branch validator self-test: PASS (5 cases)");
