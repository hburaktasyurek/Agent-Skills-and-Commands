# Case 9: PR head changes during review

## Frozen review timeline

- PR: 50
- Base when review started: `3333333333333333333333333333333333333333`
- Head when review started: `4444444444444444444444444444444444444444`
- The reviewer completed discovery and inspected the complete diff for that
  head.
- Before the report was produced, the PR host resolved the current head as
  `5555555555555555555555555555555555555555`.
- The new head contains an additional implementation commit. Its delta and
  consequence surfaces have not been inspected.

No terminal finding from the earlier head may be attached to the new head.
