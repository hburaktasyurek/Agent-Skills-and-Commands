#!/usr/bin/env node

import assert from "node:assert/strict";
import {validateArtifact} from "./validate-pr-artifact.mjs";

const valid = `## What This PR Does

### The Problem

The same subscription could be processed twice and support could not see why.

### The Solution

Recovery previously depended on four independent teams avoiding the same case.

- Customer, automatic, support, and back-office recovery now share the same protection, so the same subscription cannot be processed twice.
- Operations can safely resume work for 1,600 delayed subscriptions.
- Support can see whether a case proceeded or stopped and why, instead of reconstructing the answer from logs.

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
  "Recovery previously depended on four independent teams avoiding the same case.",
  "A repository-only allowlist and egress gate now protects the payload producers.",
);
assert.ok(validateArtifact("Recovery: prevent duplicate processing", leaked).some(
  (error) => error.includes("mechanism language"),
));

const activityOnly = valid.replace(
  /Recovery previously[\s\S]*?## What Changes for the Team/,
  `This change contains substantial activity.

- 9 commits were written.
- 27 files were changed.
- 4,651 lines were added.

## What Changes for the Team`,
);
assert.ok(validateArtifact("Recovery: prevent duplicate processing", activityOnly).some(
  (error) => error.includes("substitutes Git activity"),
));

assert.ok(validateArtifact("Enforce browser egress allowlist gates", valid).some(
  (error) => error.includes("internal mechanism"),
));

assert.ok(validateArtifact("Recovery: prevent duplicates — 27-file boundary", valid).some(
  (error) => error.includes("Git activity"),
));

const tooThin = valid.replace(
  /Recovery previously[\s\S]*?## What Changes for the Team/,
  `This change improves recovery.

- Duplicate work is reduced.
- Support has more information.

## What Changes for the Team`,
);
assert.ok(validateArtifact("Recovery: prevent duplicate processing", tooThin).some(
  (error) => error.includes("at least 3"),
));

const securityValue = valid
  .replace(
    "The same subscription could be processed twice and support could not see why.",
    "Payment screens and internal payment tools could send powerful Stripe account credentials to a person's browser. If exposed, those credentials could allow unauthorized access to payment operations, while the team had no independent proof that the real account was safe.",
  )
  .replace(
    /Recovery previously[\s\S]*?## What Changes for the Team/,
    `This work replaces reliance on every developer remembering what must stay hidden with protection across every known way payment information reaches customers and staff.

- Every known customer-facing and staff payment response is covered, so one forgotten response cannot silently reintroduce the exposure.
- A real incident cannot be marked over merely because code changed; the team must prove the credentials were contained, removed, replaced, and checked against the correct Stripe account and site.
- Missing, inconsistent, future-dated, wrong-account, or altered proof stops later payment work instead of allowing a false sign-off.
- Support and release owners gain one independently checkable record showing what was completed and what still blocks approval.

## What Changes for the Team`,
  )
  .replace(
    "Automatic recovery can resume safely.",
    "Later payment work can proceed only when the real account is independently shown to be safe.",
  );
assert.deepEqual(
  validateArtifact("Phase 4.5.11: Keep Stripe account credentials out of payment screens", securityValue),
  [],
);

const liveFailure = valid
  .replace(
    "The same subscription could be processed twice and support could not see why.",
    "Payment responses could expose credentials intended only for server-side use. Repository-only checks could not establish closure before rollout preparation.",
  )
  .replace(
    /Recovery previously[\s\S]*?## What Changes for the Team/,
    `This nine-commit, 27-file delivery adds safeguards and an evidence-based gate before rollout preparation.

## What Changes for the Team`,
  );
const liveErrors = validateArtifact(
  "Phase 4.5.11: Prevent Stripe credential exposure — 27-file boundary",
  liveFailure,
);
assert.ok(liveErrors.some((error) => error.includes("Git activity")));
assert.ok(liveErrors.some((error) => error.includes("at least 3")));
assert.ok(liveErrors.some((error) => error.includes("mechanism language")));

console.log("pr-branch validator self-test: PASS (9 cases)");
