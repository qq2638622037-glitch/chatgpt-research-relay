# Dispatcher Examples

Use these examples to resolve format or boundary questions. Do not copy domain details into unrelated packets.

## Example A - Simple current fact check
```yaml
protocol: research-task/v1
task_id: RR-20260917-A1B2C3
objective: "Verify the current official availability and platform support of Feature X."
decision_use: "Decide whether the Master project can rely on Feature X this week."
known_facts: []
questions:
  - "Is Feature X officially available now?"
  - "Which supported platforms/accounts are documented?"
scope:
  include: ["current official availability", "supported platforms"]
  exclude: ["rumors", "future roadmap speculation"]
constraints: []
artifact_inputs: []
source_policy:
  priority: ["official product documentation", "official release notes"]
  required: []
  forbidden: ["search snippets as final evidence"]
  freshness: "Current as of the research date"
research_budget:
  depth: light
  max_refinement_rounds: 1
output_contract:
  artifact_required: true
  artifact_target: "chat_file"
  master_digest_max_chars: 500
  expose_conflicts: true
  expose_uncertainty: true
stop_conditions:
  - "Official evidence answers both questions."
  - "Budget is exhausted; return the correct non-COMPLETE status."
```

## Example B - Domain rule injection without project-history dump
```yaml
protocol: research-task/v1
task_id: RR-20260917-D4E5F6
objective: "Determine whether the current S4 PVP page supports claim Y for creature Z."
decision_use: "Decide whether claim Y can enter the Master's authoritative PVP dataset."
known_facts:
  - fact: "Only PVP-tab evidence is admissible for this dataset."
    status: confirmed
questions:
  - "What does the current S4 PVP page explicitly state about Y?"
  - "Is there direct evidence or only an inference?"
scope:
  include: ["S4 PVP page", "directly relevant current evidence"]
  exclude: ["PVE page", "older-season assumptions"]
constraints:
  - "Do not import PVE-only data into the conclusion."
artifact_inputs: []
source_policy:
  priority: ["designated PVP source", "current first-party or direct evidence"]
  required: []
  forbidden: ["PVE-only pages as proof of a PVP claim"]
  freshness: "Current S4"
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
  - "The claim is directly supported, directly contradicted, or clearly remains unproven."
  - "Budget is exhausted; return PARTIAL/CONFLICTING/NO_EVIDENCE as appropriate."
```

## Example C - Do not delegate
Master request: "Using the three accepted Worker digests already in this chat, decide how they change our project plan."

Keep this in Master. It is cross-task synthesis, not a leaf research task.
