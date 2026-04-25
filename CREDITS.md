# Credits

This repo is a curated personal collection of agent skills, commands, and templates. Skills under `skills/` are **vendored from upstream sources**; the standards under `standards/` are adapted from an upstream framework. This file records every external source so attribution stays intact.

If you fork this repo, keep this file (and the original upstream licenses) in place.

---

## mattpocock/skills

Source: https://github.com/mattpocock/skills
License: MIT

Vendored verbatim into [skills/](skills/). The descriptions and structure follow Matt Pocock's conventions, which the rest of this repo also adopts.

| Skill | Path | Upstream |
|-------|------|----------|
| grill-me | [skills/grill-me/SKILL.md](skills/grill-me/SKILL.md) | https://github.com/mattpocock/skills/tree/main/grill-me |
| tdd | [skills/tdd/SKILL.md](skills/tdd/SKILL.md) | https://github.com/mattpocock/skills/tree/main/tdd |
| triage-issue | [skills/triage-issue/SKILL.md](skills/triage-issue/SKILL.md) | https://github.com/mattpocock/skills/tree/main/triage-issue |
| request-refactor-plan | [skills/request-refactor-plan/SKILL.md](skills/request-refactor-plan/SKILL.md) | https://github.com/mattpocock/skills/tree/main/request-refactor-plan |
| improve-codebase-architecture | [skills/improve-codebase-architecture/SKILL.md](skills/improve-codebase-architecture/SKILL.md) | https://github.com/mattpocock/skills/tree/main/improve-codebase-architecture |

The `tdd` skill ships with reference docs ([tests.md](skills/tdd/tests.md), [mocking.md](skills/tdd/mocking.md), [deep-modules.md](skills/tdd/deep-modules.md), [interface-design.md](skills/tdd/interface-design.md), [refactoring.md](skills/tdd/refactoring.md)) and `improve-codebase-architecture` ships with [REFERENCE.md](skills/improve-codebase-architecture/REFERENCE.md) — both vendored from the same upstream.

---

## Brian Casel — agent-os

Source: https://github.com/buildermethods/agent-os
Author: Brian Casel

Files under [standards/](standards/) are **adapted** from agent-os, not pristine copies. They have been edited to fit this repo's conventions and the user's project setup workflow.

| Standard | Path |
|----------|------|
| plan-product | [standards/plan-product.md](standards/plan-product.md) |
| inject-standards | [standards/inject-standards.md](standards/inject-standards.md) |
| index-standards | [standards/index-standards.md](standards/index-standards.md) |
| discover-standards | [standards/discover-standards.md](standards/discover-standards.md) |

Refer to the upstream repo for the original framework. Treat the versions in this repo as a personal fork.

---

## Original work

Authored by Hasan Burak Taşyürek, MIT licensed (see [LICENSE](LICENSE)).

| File | Path | Notes |
|------|------|-------|
| to-spec skill | [skills/to-spec/SKILL.md](skills/to-spec/SKILL.md) | Combines shape-spec (agent-os) + to-prd (mattpocock/skills) into a codebase-grounded spec workflow |
| make-agent-do-things command | [commands/make-agent-do-things.md](commands/make-agent-do-things.md) | |
| ux-expert agent | [agents/ux-expert.md](agents/ux-expert.md) | |
| product-lead agent | [agents/product-lead.md](agents/product-lead.md) | |
| review-design agent | [agents/review-design.md](agents/review-design.md) | |
| review-implementation agent | [agents/review-implementation.md](agents/review-implementation.md) | |
| cto agent | [agents/cto.md](agents/cto.md) | |

The repo's overall structure, install/init scripts, agent-template `CORE` / `PROJECT CONTEXT` split, and the curation itself are also original work.
