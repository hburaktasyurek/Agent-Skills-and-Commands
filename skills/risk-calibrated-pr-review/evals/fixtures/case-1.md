# Case 1: fleet-wide startup failure

PR 42 removes `critical-runtime` from the production package manifest while
`service.js` still imports it before startup. Merge automatically starts a
rolling fleet replacement. There is no alternate serving path or automatic
rollback. Recovery requires restoring the manifest, rebuilding the image, and
redeploying it.
