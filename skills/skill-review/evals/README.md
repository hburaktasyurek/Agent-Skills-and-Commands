# skill-review fixtures

- `purpose-pass`: expect all four static purpose questions yes, exact current
  package hash, and no behavioral-success claim.
- `purpose-fail`: expect Q1–Q4 no, exact current package hash, and
  `purpose_fail` with a closed remedy list.

These fixtures test the static contract gate only. Behavioral proof belongs to
`skill-eval` and cannot be inferred from `purpose_pass`.
