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

## If you want to add a skill (for your fork)

New skills should match the conventions used throughout this repo, which follow [mattpocock/skills](https://github.com/mattpocock/skills). The full conventions are documented in the [Skill Anatomy](README.md#skill-anatomy) section of the README.

Quick checklist:

- Frontmatter has `name` and `description`. No `type` field.
- Description follows the formula: *what it does (verb-first, present tense) + when to use it, including literal phrases the user might say*.
- Skill body length matches the skill type — behavioral skills can be three sentences; methodology skills can be long with reference files.
- File path is `skills/<skill-name>/SKILL.md`.
- Reference docs live as siblings of `SKILL.md` and are linked from it.

## Vendored content

Skills under `skills/` and standards under `standards/` are vendored or adapted from upstream sources. See [CREDITS.md](CREDITS.md). If you submit changes touching vendored files, prefer upstreaming the change first and re-vendoring here, unless the change is specific to this repo's setup.

## Licensing

This repo is MIT licensed (see [LICENSE](LICENSE)). Vendored files retain their original licenses; CREDITS.md tracks them.
