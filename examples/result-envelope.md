# Example Result Envelope

```yaml
protocol: research-result/v1
task_id: RR-20260917-001

status: PARTIAL
confidence: MEDIUM

master_digest: >-
  One current first-party source supports part of the observed behavior, but the
  exact edge case in the Task Packet is not documented. A reproducible community
  test is consistent with the observation. This is sufficient as a working
  hypothesis, not yet as a fully confirmed fact.

key_findings:
  - "First-party documentation supports the base behavior."
  - "The requested edge case remains undocumented."
  - "One reproducible community test is consistent with the user's observation."

conflicts: []

unresolved:
  - "No direct first-party evidence for the exact edge case."

recommended_next_action:
  - "Run a controlled user test or wait for first-party documentation."

artifact_ref: "RR-20260917-001_evidence.md"
```
