# PR context

- Retry workers could claim the same renewal twice after a restart.
- The change protects renewal processing from duplicate claims.
- Observed: `node --test test/claim.test.js` passed 3 tests, 0 failed.
- Full suite: not run.
