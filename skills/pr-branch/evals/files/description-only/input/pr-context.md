# PR context

- This change protects 12,000 monthly subscription renewals from duplicate retry scheduling.
- Exact observed verification: `node --test test/retry.test.js` passed 2 tests, 0 failed.
- The full test suite was not run.
