# Example Task Packet

```yaml
protocol: research-task/v1
task_id: RR-20260917-001

objective: "Verify whether a specific behavior is documented in current first-party sources."

decision_use: "Decide whether the Master may treat the behavior as a confirmed assumption."

known_facts:
  - fact: "The user observed the behavior once in a live test."
    status: user_observation

questions:
  - "Is the behavior documented by a first-party source?"
  - "Are there credible contradictory reports?"

scope:
  include:
    - "Current documentation and directly relevant evidence"
  exclude:
    - "Unrelated historical versions"

constraints: []

artifact_inputs: []

source_policy:
  priority:
    - "First-party documentation"
    - "Direct reproducible evidence"
  required: []
  forbidden: []
  freshness: "Prefer current-version sources"

research_budget:
  depth: standard
  max_refinement_rounds: 2

output_contract:
  artifact_required: true
  artifact_target: "chat_file"
  master_digest_max_chars: 600
  expose_conflicts: true
  expose_uncertainty: true

stop_conditions:
  - "Evidence is sufficient to answer every decision-critical question."
  - "Budget is exhausted; return the correct non-COMPLETE status instead of searching indefinitely."
```
