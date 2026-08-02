# Frozen review fixture: generic CLI

## Named specification: `specs/active-report.md`

The `active-report` command reads JSON records and emits only records whose
`active` field is the boolean value `true`. Output contains `id` and `name`
only and is sorted by name case-insensitively, then by numeric id. Malformed
JSON must produce a non-zero exit without partial output.

## Implementation basis: `src/active-report.js`

```js
export function activeReport(rows) {
  return rows
    .filter((row) => Boolean(row.active))
    .map(({ id, name }) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name) || a.id - b.id);
}
```

`src/cli.js` parses the complete input before calling `activeReport`; parse
failure sets exit code 1 and writes no report rows.

## Tests

Tests cover boolean `true`/`false`, output projection, malformed input, and
names `beta` and `gamma`. They do not cover string values such as `"false"` or
names that differ by case.

There is no framework manifest, tenant model, payment integration, or project
memory contract in this fixture.
