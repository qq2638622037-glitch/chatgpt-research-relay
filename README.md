# Research Relay

**Give ChatGPT research workers less context — not more.**

Research Relay is a context-isolated Master/Worker research workflow for **ChatGPT Projects + Skills**. It is designed for long-running projects where the main conversation should keep project goals and decisions, while detailed web research, evidence collection, conflicts, and failed searches stay outside the Master context.

> Stop sending your entire project history to every research task.

## Why this exists

Long-running ChatGPT projects often mix two very different jobs in one conversation:

- project memory, decisions, and orchestration;
- web searches, source checking, intermediate evidence, and research dead ends.

Research Relay separates them.

```text
MASTER PROJECT
  │
  │  research-dispatcher
  │  creates a minimal Task Packet
  ▼
================ CONTEXT FIREWALL ================
  ▼
RESEARCH WORKER PROJECT
  │
  │  research-worker
  ├── Evidence Artifact  (detailed)
  └── Result Envelope    (compact)
          │
          ▼
MASTER PROJECT
```

The goal is **context isolation and cleaner information flow**, not bypassing account or model usage limits.

## Core ideas

- **Master owns the project; Worker owns only the task.**
- **Task Packet is the single task truth.**
- **Minimal sufficient context by default.**
- **Old chats and artifacts are not reusable unless explicitly named.**
- **Detailed evidence goes to an Artifact, not back into the Master chat.**
- **The Master receives a compact Result Envelope first.**
- **Conflicts, missing evidence, and failures are explicit.**
- **Research is bounded by scope, budget, and stop conditions.**

## Included Skills

### `research-dispatcher`

Use in the Master project. It decides whether a research task should be delegated, converts the current need into a minimal versioned Task Packet, splits oversized work when necessary, and later intakes the Worker's compact result.

### `research-worker`

Use in the Research Worker project. It validates the Task Packet, researches only the assigned questions, prefers direct/current evidence, records conflicts and missing evidence, creates a detailed Evidence Artifact, and returns a compact Result Envelope.

## Quick start

1. Install the two Skills in ChatGPT.
2. Create a **Master Project** for your long-running project.
3. Create a separate **Research Worker Project** for isolated research tasks.
4. In the Master Project, ask `research-dispatcher` to package a bounded research task.
5. Copy the resulting `research-task/v1` Task Packet into a fresh Worker chat.
6. Let `research-worker` execute the packet and produce:
   - a detailed Evidence Artifact;
   - a short `research-result/v1` Result Envelope.
7. Return only the Result Envelope to the Master first.
8. Open the full Artifact only when an audit, conflict, or deeper review requires it.

See [`examples/task-packet.md`](examples/task-packet.md) and [`examples/result-envelope.md`](examples/result-envelope.md).

## Task Packet example

```yaml
protocol: research-task/v1
task_id: RR-20260917-001
objective: "Verify whether a specific product behavior is documented in current first-party sources."
decision_use: "Help the Master decide whether the behavior can be treated as a confirmed project assumption."

known_facts:
  - fact: "The user observed the behavior once in a live test."
    confidence: user_observation

questions:
  - "Is the behavior documented by a first-party source?"
  - "Are there credible contradictory reports?"

artifact_inputs: []

scope:
  include:
    - "Current documentation and directly relevant evidence"
  exclude:
    - "Unrelated historical versions"

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
  master_digest_max_chars: 600
  expose_conflicts: true
  expose_uncertainty: true

stop_conditions:
  - "Evidence is sufficient to answer the core questions"
  - "Budget is exhausted; return PARTIAL or CONFLICTING instead of searching indefinitely"
```

## Result states

Research Relay uses explicit completion states instead of forcing every task to look finished:

- `COMPLETE`
- `PARTIAL`
- `BLOCKED`
- `CONFLICTING`
- `NO_EVIDENCE`

## Repository layout

```text
chatgpt-research-relay/
├── README.md
├── README.zh-CN.md
├── LICENSE
├── CHANGELOG.md
├── CONTRIBUTING.md
├── research-dispatcher/
│   ├── SKILL.md
│   ├── agents/
│   └── references/
├── research-worker/
│   ├── SKILL.md
│   ├── agents/
│   └── references/
├── examples/
└── docs/
```

## Design notes

The V1 intentionally stays small:

- no external Agent runtime is required;
- no Work/Codex dependency is required;
- no Google Drive dependency is required;
- no automatic Auditor is included yet;
- no scripts are required for the core protocol.

A future version may add deterministic schema validation, artifact naming helpers, and an optional research-auditor Skill.

## Pressure tests

V1 was designed against eight pressure-test categories, including oversized Master context, conflicting evidence, no-evidence cases, forbidden sources, overly long results, Worker-history contamination, and lightweight Master intake.

See [`docs/pressure-tests.md`](docs/pressure-tests.md).

## Acknowledgements and inspiration

The architecture was informed by ideas from several public projects and documents, including:

- OpenAI ChatGPT Skills and Projects documentation
- OpenAI Agents SDK handoff patterns
- Anthropic Agent Skills / progressive disclosure
- obra/superpowers
- LangChain Deep Agents and subagent architecture
- cinatra-ai/web-research-skill
- drader/researcher_agent
- danielcherubini/skills

Research Relay is an independent workflow and is not affiliated with those projects.

## Contributing

Feedback is especially useful around:

- Task Packet fields that are redundant or missing;
- cases where the Dispatcher sends too much context;
- Worker history contamination;
- evidence-policy edge cases;
- Result Envelope length and usefulness;
- real-world workflows where the protocol breaks down.

See [`CONTRIBUTING.md`](CONTRIBUTING.md).

## License

MIT License. See [`LICENSE`](LICENSE).

---

**中文说明：** [`README.zh-CN.md`](README.zh-CN.md)
