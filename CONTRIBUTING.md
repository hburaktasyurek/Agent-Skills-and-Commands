# Contributing

This repository is a personal toolkit shared publicly for reuse. Forking it is
the recommended way to adapt it.

## Bug reports and suggestions

GitHub issues are welcome, but there is no response SLA.

## Pull requests

- Keep one concern per PR.
- For more than a typo, open an issue first to check fit.
- Do not expect a fast review or merge.

## Adding or changing a skill in your fork

1. Use your host's `skill-creator` with concrete usage examples.
2. Create or edit `skills/<name>/`; include only runtime-relevant files.
3. Run the creator's structural validation.
4. For substantial behavior, compare the package with an exact Git or
   without-skill baseline using [skill-eval](skills/skill-eval/SKILL.md).
5. Review produced artifacts, not only headings or claimed procedure.
6. Update [skills/INDEX.md](skills/INDEX.md) and [README.md](README.md).
7. Commit the coherent change. Global installation is separate.

## Licensing

This repository is MIT licensed; see [LICENSE](LICENSE).
