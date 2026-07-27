# Loop Run Record Contract

## Input

```json
{
  "goal_input": "<exact universal goal input>",
  "goal_result": "<exact rendered goal result>",
  "readiness_input": "<answers, risk, and applicability envelope>",
  "readiness_result": "<exact ready assessment>",
  "observation": {
    "check_results": [
      {
        "check": "Exact validation check",
        "status": "pass | partial | fail",
        "evidence": ["Observed command, score, artifact, or reviewer evidence"]
      }
    ],
    "hypothesis_outcome": "confirmed | rejected | inconclusive | not-applicable",
    "feedback": "What held, failed, or should change",
    "next_action": "stop | adjust | human-action",
    "human_return_reason": "Why a human owns the next decision"
  }
}
```

The readiness envelope may repeat `goal_input` and `goal_result`. When present,
those copies must exactly match the top-level artifacts; detached copies are
rejected. The deterministic core then reassesses with the canonical top-level
artifacts.

Every canonical validation check appears exactly once. `yes` means all checks
passed, `no` means at least one failed, and `partial` means no failures but at
least one partial result.

## Output

```yaml
record_id: sha256:<deterministic identity>
assessment_id: <exact readiness assessment identity>
methodology: <exact slug>
goal_character_count: <Unicode count>
readiness:
  score: <0-100>
  band: <authoritative band>
  verdict: ready
expected_evidence: <goal_input.validation.evidence>
actual_evidence: <flattened observed evidence>
check_results: <canonical ordered results>
result: yes | partial | no
hypothesis_outcome: <input value>
feedback: <input value>
next_action: stop | adjust | human-action
human_return_reason: <input value>
status: review-required
```

The output is a proposal for human review. It is not execution permission,
memory mutation, or approval for another run.
