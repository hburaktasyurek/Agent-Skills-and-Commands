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

## Skill-first

New behavior is added as a skill first. Agents and slash commands stay in this repo only where they genuinely need subagent semantics — separate context window, spawnable by other skills, or constrained tool surface. If a piece of behavior could equally be a skill, make it a skill.

## If you want to add a skill (for your fork)

The functional minimum is in the [Skill Anatomy](README.md#skill-anatomy) section of the README: a `skills/<name>/SKILL.md` with `name` and `description` in the frontmatter. Body shape and length vary by purpose — no template is enforced.

When adding a skill, also list it in [skills/INDEX.md](skills/INDEX.md) under the section that fits.

## Licensing

This repo is MIT licensed (see [LICENSE](LICENSE)).
