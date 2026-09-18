# Task Packet Intake - research-task/v1

Accept this required shape:
```yaml
protocol: research-task/v1
task_id: RR-YYYYMMDD-XXXXXX
objective: "..."
decision_use: "..."
known_facts:
  - fact: "..."
    status: confirmed | user_observation | working_assumption
questions: []
scope:
  include: []
  exclude: []
constraints: []
artifact_inputs:
  - ref: "..."
    purpose: "..."
    required: true | false
source_policy:
  priority: []
  required: []
  forbidden: []
  freshness: "..."
research_budget:
  depth: light | standard | deep
  max_refinement_rounds: 2
output_contract:
  artifact_required: true
  artifact_target: "chat_file"
  master_digest_max_chars: 600
  expose_conflicts: true
  expose_uncertainty: true
stop_conditions: []
```

## Intake validation
Before research:

1. Confirm `protocol` is exactly `research-task/v1`.
2. Confirm `task_id`, `objective`, and `decision_use` are present and usable.
3. Confirm every `known_facts` entry has a `fact` plus a valid `status`: `confirmed`, `user_observation`, or `working_assumption`.
4. Confirm `questions`, `scope.include`, `scope.exclude`, and `constraints` are present and usable for the task.
5. Confirm `source_policy`, `research_budget`, `output_contract`, and `stop_conditions` are usable.
6. Confirm required `artifact_inputs` are actually accessible when the task depends on them.
7. Identify contradictions inside the packet without silently repairing them.
8. Never fill a missing decision-critical field from old Worker history.

If the packet is executable despite a minor omission, proceed and record the assumption in the Artifact. If an essential input is missing and the task cannot be executed faithfully, return `BLOCKED` with the missing requirement instead of improvising.

## Context firewall
Treat these as valid pre-existing context:

- Explicit `known_facts`.
- Explicit packet constraints and policies.
- Explicitly named `artifact_inputs`.
- New evidence discovered while executing this task.

Do not treat these as valid task facts unless explicitly included:

- Prior Worker chat conclusions.
- Other tasks from the same Worker Project.
- Unreferenced project files.
- Remembered Master decisions.

If old context surfaces mentally, use it only to form a search query; do not cite or depend on it until independently verified or explicitly authorized.
