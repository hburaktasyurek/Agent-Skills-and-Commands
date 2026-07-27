# Workflow Compatibility Audit

Audit baseline: repository skill sources on branch `loop-engineering` at
`c44e3a9`. This report describes compatibility; it does not edit the audited
skills.

| Skill | Fit | Actual user input | Current skill requirement | Output | Extra interaction | Future tune candidate |
|---|---|---|---|---|---|---|
| `task-groundwork` | `uyumlu` | Roadmap path + task number | Locates the roadmap/task, reads repository evidence, asks only unresolved business questions | Canonical grounded summary for `to-spec` | User decisions and approved deferrals when artifacts cannot close a branch | None from the input contract |
| `to-spec` | `uyumlu` | Complete groundwork output | Reads conversation context plus repository evidence | Four-file spec cluster | Stops on unresolved questions; may confirm a non-obvious slug/path | None from the input contract |
| `adversarial-spec-review` | `uyumlu` | Spec cluster path | Exact current spec files and directly referenced evidence | Current P0–P3 review | None when scope is resolvable | A future structured verdict could simplify recording, but is not required now |
| `revise-spec-from-review` | `koşullu uyumlu` | Review or readiness output | Also requires the exact named spec folder and existing task goal/scope/user decisions | Locally reconciled spec edits or an unresolved stop | May request missing folder, evidence, decision, or permission | Make the normal handoff derivable from the supplied review without hiding required context |
| `spec-readiness` | `uyumlu` | Spec cluster path | Exact current spec artifacts and relevant Git state | `READY`/`NOT READY` plus findings | None when scope is resolvable | A future structured receipt could simplify recording |
| `senior-implementer` | `uyumlu` | Approved spec cluster path | Explicit invocation, every file in the brief, and repository conventions | Verified implementation or a blocking ambiguity | User decision only when the approved brief breaks structurally | None from the input contract |
| `commit-work` | `uyumlu` | No separate task input | Reads current status/diffs and stages intended Git changes | Commit(s), push result, final Git state | Stops on secrets, incoherent scope, or a failed command | None from the input contract |
| `pr-branch` | `uyumsuz` — variable-model policy | No separate task input | Reads branch/commits/diff, requires human base confirmation, then hard-codes a `sonnet` PR agent | Open PR and URL | Base branch confirmation is mandatory | Remove model lock-in while preserving explicit base confirmation |
| `adversarial-diff-review` | `koşullu uyumlu` | PR number | Also requires a resolvable task definition; PR number supplies the diff boundary but not necessarily the task contract | Current P0–P3 review with coverage | Requests task definition if PR/spec context cannot supply it | Ensure PR output carries an exact spec/task reference usable from the PR number |

## Audit conclusion

The stable workflow is sound. The normal handoff friction is concentrated in
three places: revise needs more context than the user normally supplies,
PR creation fixes a model despite the variable-model policy, and diff review
cannot guarantee task scope from a PR number unless the PR carries it.

These are evidence for later focused `tune-skill` work. They are not permission
to modify any audited skill in this implementation.
