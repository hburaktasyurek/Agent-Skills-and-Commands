# Task: strict port parser

Add a dependency-free `parsePort(value)` helper. It accepts only a string of
ASCII decimal digits whose numeric value is from 1 through 65535. It returns
the number. It throws `TypeError` for non-strings and `RangeError` for every
other invalid string. Do not change startup defaults or environment handling.

Review boundary: `diff.patch` is the exact complete diff. `parse-port.js`,
`parse-port.test.js`, and `start.js` are the current implementation, tests, and
only caller. `test-record.txt` is the complete supplied verification record.
