# Task Packet Contract — research-task/v1

Use this contract whenever creating or revising a Research Relay task.

## Required shape

```yaml
protocol: research-task/v1
task_id: RR-YYYYMMDD-XXXXXX
objective: "One sentence stating what the Worker must establish."
decision_use: "What Master decision or project action this research will inform."

known_facts:
  - fact: "..."
    status: confirmed | user_observation | working_assumption

questions:
  - "Required question 1"

scope:
  include: []
  exclude: []

constraints: []

artifact_inputs:
  - ref: "file / URL / artifact reference"
    purpose: "Why this prior material is allowed"
    required: true | false

source_policy:
  priority: []
  required: []
  forbidden: []
  freshness: "Current/freshness requirement or 'not time-sensitive'"

research_budget:
  depth: light | standard | deep
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

## Field rules

### `task_id`

Generate a fresh identifier for each independent packet. Prefer `RR-YYYYMMDD-XXXXXX`, where the suffix is a short unique alphanumeric token. Preserve the same `task_id` when revising the same task; add a revision marker in surrounding Master notes if needed rather than inventing a new research identity.

### `objective`

State one research outcome, not a project mission. If the sentence contains several unrelated outcomes, split the packet.

### `decision_use`

Explain why the answer matters. Use it to prevent irrelevant research, not to bias the Worker toward a preferred conclusion.

### `known_facts`

Include only facts the Worker must know before searching.

- `confirmed`: treat as established task context unless the packet explicitly asks to re-verify it.
- `user_observation`: treat as a valid reported observation; distinguish it from externally verified evidence.
- `working_assumption`: use provisionally and surface material contradictions.

Do not use `known_facts` as a compressed dump of Master history.

### `questions`

Make every decision-critical question explicit. Keep them non-overlapping when possible. Avoid adding curiosity questions that do not affect the decision use.

### `scope` and `constraints`

Use `scope.include/exclude` for topical boundaries. Use `constraints` for execution rules such as "PVP tab only", "do not use snippets as final evidence", or "compare only currently supported versions".

### `artifact_inputs`

List only prior materials the Worker is explicitly allowed to use as task evidence/context. If none are required, use an empty list. Do not assume Worker Project history is implicitly allowed.

### `source_policy`

Specify project-specific source rules only when they matter. Put required first-party sources, banned source types, version requirements, and freshness requirements here.

### `research_budget`

Treat `depth` as a breadth/depth guide, not a quota to exhaust. Treat `max_refinement_rounds` as a hard ceiling after the initial research pass. Allow early stopping when evidence is sufficient.

Recommended defaults:

- `light`: narrow fact check; minimal source set and one targeted verification pass.
- `standard`: multi-source verification with a gap check; usually enough for ordinary research.
- `deep`: decompose the research into subquestions, use broader source coverage, and perform bounded refinement.

### `output_contract`

Default to a Markdown Evidence Artifact plus a compact Result Envelope.

Default `artifact_target` to `chat_file`. Change it only when the user explicitly requests another supported destination.

Keep Google Drive optional; never make it a hidden prerequisite.
### `stop_conditions`

Always include evidence sufficiency and budget exhaustion. Add task-specific conditions when useful.

## Minimal-context test

Before emitting the packet, challenge every included item:

> If this item were removed, could the Worker still search correctly, interpret evidence correctly, and satisfy the output contract?

Remove it when the answer is yes.
