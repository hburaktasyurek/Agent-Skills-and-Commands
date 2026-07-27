# Supported Methodology Catalog

The machine-readable index is [manifest.json](manifest.json). Each referenced
file is the single canonical source for that method's definition, positive and
negative fit, principles, steps, quality questions, and stop rule.

| Method | Slug | Reference |
|---|---|---|
| Pyramid Principle | `pyramid-principle` | [pyramid-principle.md](pyramid-principle.md) |
| 5 Whys | `five-whys` | [five-whys.md](five-whys.md) |
| 5W2H | `five-w-two-h` | [five-w-two-h.md](five-w-two-h.md) |
| SMART Goals | `smart-goals` | [smart-goals.md](smart-goals.md) |
| PDCA | `pdca` | [pdca.md](pdca.md) |
| SWOT | `swot` | [swot.md](swot.md) |
| STAR | `star` | [star.md](star.md) |
| AIDA | `aida` | [aida.md](aida.md) |
| Feynman Technique | `feynman` | [feynman.md](feynman.md) |
| OKR | `okr` | [okr.md](okr.md) |
| Work Breakdown Structure | `work-breakdown-structure` | [work-breakdown-structure.md](work-breakdown-structure.md) |
| Decision Matrix | `decision-matrix` | [decision-matrix.md](decision-matrix.md) |

## Precedence for overlaps

- Select the method that owns the current stage, not every method that may help
  later.
- A candidate's canonical negative fit vetoes keyword similarity.
- Open-ended discovery or evidence-gap collection does not default to 5W2H.
  Select 5W2H only when the requested artifact is explicitly the complete
  what/why/who/where/when/how/how-much operating frame.
- Defer a later-stage method rather than blending methods.
- Choose `none` when every candidate is vetoed or the task is already bounded
  direct execution.

The source model was adapted from the method-fit structure in the
[Loop Engineering Methodology Skill Generator](https://loopengineering.app/methodology-skill-generator/).
