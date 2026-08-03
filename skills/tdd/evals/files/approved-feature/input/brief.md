# Approved brief: normalizeTags

Status: approved for implementation.

Implement the public `normalizeTags(tags)` function in `src/tags.js`.

- Input must be an array of strings; otherwise throw `TypeError`.
- Return trimmed, lowercase, non-empty tags.
- Remove duplicates while preserving first-seen order.
- Do not mutate the input array.
- Change only `src/tags.js` and `test/tags.test.js`.
- Use focused red-green cycles, then run the complete fixture test suite.
