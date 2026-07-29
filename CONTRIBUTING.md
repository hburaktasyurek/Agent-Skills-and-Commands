# Contributing

This repo is a personal toolkit. It is shared publicly because the contents may be useful to others, not because it is a community-maintained project.

**Fork freely.** That is the recommended way to use it.

## Bug reports and suggestions

GitHub issues are open and welcome. There is **no response SLA** — this is a side project and replies happen when they happen. Don't wait on a response if you have a fix; just fork.

## Pull requests

PRs are not actively solicited. If you open one:

- Keep it scoped to a single concern.
- Don't expect a fast review or a merge.
- For anything beyond a typo, open an issue first to check whether the change fits the direction of the repo.

If your idea is bigger than a small fix, fork is almost always the better path.

## Adding a skill to your fork

Follow the Skill design loop in [WORKFLOW.md](WORKFLOW.md):
`skill-path-selector` → (if needed) `skill-brief` (bounded `grill-me` for
missing checklist fields) → path → `skill-creator` draft under
`.skill-proposals/` → separate `skill-review` → optional
`revise-skill-from-review` → human **ship** into `skills/`. Prefer a
methodology-bound skill; if the idea is not reducible to one method, decompose.
After ship, use `tune-skill` for behavior complaints.

The functional minimum remains in the [Skill Anatomy](README.md#skill-anatomy)
section of the README: a `skills/<name>/SKILL.md` with `name` and `description`
in the frontmatter. When adding a skill, also list it in
[skills/INDEX.md](skills/INDEX.md) under the section that fits.

## Licensing

This repo is MIT licensed (see [LICENSE](LICENSE)).
