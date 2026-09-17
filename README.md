# Research Relay

**Keep research context out of your Master chat.**

> **Independent project:** Research Relay is an independent open-source project and is not affiliated with, endorsed by, or sponsored by OpenAI. “ChatGPT” is used only to describe the environment this project is designed for.

![Research Relay — context-isolated Master/Worker research workflow](research-relay-hero.png)

[简体中文](README.zh-CN.md) · [Architecture](docs/architecture.md) · [Examples](examples/task-packet.md) · [Discussions](https://github.com/qq2638622037-glitch/chatgpt-research-relay/discussions)

[![Release](https://img.shields.io/github/v/release/qq2638622037-glitch/chatgpt-research-relay?display_name=tag&style=flat-square)](https://github.com/qq2638622037-glitch/chatgpt-research-relay/releases/latest)
[![License](https://img.shields.io/github/license/qq2638622037-glitch/chatgpt-research-relay?style=flat-square)](LICENSE)
[![Stars](https://img.shields.io/github/stars/qq2638622037-glitch/chatgpt-research-relay?style=flat-square)](https://github.com/qq2638622037-glitch/chatgpt-research-relay/stargazers)
![ChatGPT Skills](https://img.shields.io/badge/ChatGPT-Skills-10A37F?style=flat-square)

> **A context-isolated Master/Worker research workflow for long-running ChatGPT Projects + Skills.**

Research Relay separates **project memory** from **research execution**.

Your Master keeps the long-term goals, decisions, and project state.  
A Research Worker receives only the **minimum context needed for one task**, performs the research in isolation, stores detailed evidence outside the Master conversation, and returns only a concise result.

> **Stop sending your entire project history to every research task.**

---

## Quick Start

Research Relay uses two complementary Skills:

- **`research-dispatcher`** — install/use this in your **Master Project**
- **`research-worker`** — install/use this in a separate **Research Worker Project**

### 1. Download

Download the latest release:

**[→ Research Relay — Latest Release](https://github.com/qq2638622037-glitch/chatgpt-research-relay/releases/latest)**

From **Assets**, download:

- `research-dispatcher-v1.0.0.zip`
- `research-worker-v1.0.0.zip`

### 2. Set up two project roles

```text
MASTER PROJECT
    │
    │  research-dispatcher
    │
    └── creates a minimal Task Packet
              │
              ▼
      RESEARCH WORKER PROJECT
              │
              │  research-worker
              │
              ├── researches & verifies
              ├── writes Evidence Artifact
              └── returns short Result Envelope
                          │
                          ▼
                     MASTER PROJECT
```

The Master keeps your long-term project context.

The Worker receives only what the current research task actually needs.

### 3. Run your first task

In the Master Project, ask for a research task to be delegated using Research Relay.

The Dispatcher should produce a **Task Packet** containing only the minimum sufficient context.

Move that Task Packet to your Research Worker Project and let `research-worker` execute it.

The Worker returns:

- an **Evidence Artifact** with the detailed research and sources;
- a concise **Result Envelope** for the Master.

> Detailed research stays outside the Master conversation. Only the information needed for project decisions comes back.

### Requirements

- ChatGPT Projects
- ChatGPT Skills
- Two separate project contexts are recommended
- No ChatGPT Work required
- No Codex required
- No external Agent runtime required

---

## Before vs. After

### Without Research Relay

A long-running Master conversation often ends up doing everything:

```text
MASTER CHAT

Project goals
Long-term decisions
Historical context

Web searches
Search snippets
Failed leads
Source verification
Conflicting evidence
Intermediate findings
Detailed research notes

Final conclusions

More searches...
More context...
More history...
```

The useful long-term project state and temporary research work accumulate in the same conversation.

---

### With Research Relay

Research Relay separates the two roles:

```text
MASTER PROJECT
│
├── Goals
├── Decisions
├── Constraints
├── Long-term project state
│
└── Task Packet
        │
        ▼
════════════ CONTEXT FIREWALL ════════════
        │
        ▼
RESEARCH WORKER
│
├── Searches
├── Verification
├── Failed leads
├── Conflicting evidence
├── Detailed findings
│
├── Evidence Artifact
│      └── Full research stays here
│
└── Result Envelope
       └── Only the concise result returns
               │
               ▼
          MASTER PROJECT
```

### The difference

| Without Research Relay | With Research Relay |
|---|---|
| Research happens inside the Master chat | Research happens in a separate Worker context |
| Full project history may be reused repeatedly | Worker receives a minimal Task Packet |
| Search noise accumulates in the main conversation | Detailed evidence goes to an Artifact |
| Missing evidence can be easy to overlook | Failures and uncertainty are explicit |
| Master absorbs the entire research process | Master receives a concise Result Envelope |
| Context grows with every research task | Research context stays isolated |

> **Keep durable project knowledge in the Master. Keep temporary research work with the Worker.**

---

## Why Research Relay?

Long-running ChatGPT projects tend to accumulate two very different kinds of context:

**Project context** — goals, decisions, constraints, plans, and long-term state.

**Research context** — searches, sources, failed leads, conflicting evidence, intermediate findings, and verification work.

When both live in the same conversation, the Master becomes increasingly crowded.

Research Relay separates them:

```text
MASTER PROJECT
  │
  │  research-dispatcher
  │
  │  Minimal Task Packet
  ▼
════════════════ CONTEXT FIREWALL ════════════════
  ▼
RESEARCH WORKER
  │
  ├── Web research & verification
  │
  ├── Evidence Artifact
  │      └── Full research, sources, conflicts
  │
  └── Result Envelope
         └── Short digest + status
                 │
                 ▼
           MASTER PROJECT
```

The goal is better context isolation and cleaner information flow — **not bypassing account or model usage limits**.

---

## Core ideas

- **Master owns the project; Worker owns only the task.**
- **Task Packet is the single task truth.**
- **Minimal sufficient context by default.**
- **Old chats and artifacts are not reusable unless explicitly named.**
- **Detailed evidence goes to an Artifact, not back into the Master chat.**
- **The Master receives a compact Result Envelope first.**
- **Conflicts, missing evidence, and failures are explicit.**
- **Research is bounded by scope, budget, and stop conditions.**

---

## Included Skills

### `research-dispatcher`

Use in the Master Project.

It:

- decides whether a research task should be delegated;
- converts the current need into a minimal versioned Task Packet;
- avoids forwarding the entire project history;
- splits oversized work when necessary;
- performs lightweight intake of the Worker's compact result.

### `research-worker`

Use in the Research Worker Project.

It:

- treats the Task Packet as the current task's source of truth;
- validates whether the task is executable;
- researches only the assigned questions;
- prefers direct and current evidence;
- records conflicts and missing evidence;
- creates a detailed Evidence Artifact;
- returns a compact Result Envelope.

See:

- [`examples/task-packet.md`](examples/task-packet.md)
- [`examples/result-envelope.md`](examples/result-envelope.md)
- [`examples/evidence-artifact.md`](examples/evidence-artifact.md)

---

## Task Packet example

```yaml
protocol: research-task/v1
task_id: RR-20260917-001

objective: "Verify whether a specific product behavior is documented in current first-party sources."

decision_use: "Help the Master decide whether the behavior can be treated as a confirmed project assumption."

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

---

## Result states

Research Relay uses explicit completion states instead of forcing every task to look finished:

- `COMPLETE`
- `PARTIAL`
- `BLOCKED`
- `CONFLICTING`
- `NO_EVIDENCE`

A Worker should never turn an incomplete investigation into a fake `COMPLETE`.

---

## Artifact-first research

Detailed research belongs in an **Evidence Artifact**, not in the compact response sent back to the Master.

An Artifact can contain:

- source details;
- evidence tables;
- search paths;
- contradictory evidence;
- detailed findings;
- missing evidence;
- unresolved questions;
- follow-up suggestions.

The Master receives the shorter **Result Envelope** first and opens the Artifact only when deeper inspection is useful.

---

## Repository layout

```text
chatgpt-research-relay/
├── README.md
├── README.zh-CN.md
├── LICENSE
├── CHANGELOG.md
├── CONTRIBUTING.md
├── research-relay-hero.png
│
├── research-dispatcher/
│   ├── SKILL.md
│   ├── agents/
│   └── references/
│
├── research-worker/
│   ├── SKILL.md
│   ├── agents/
│   └── references/
│
├── examples/
└── docs/
```

---

## Design notes

V1 intentionally stays small.

It does **not** require:

- an external Agent runtime;
- ChatGPT Work;
- Codex;
- Google Drive;
- a dedicated automatic Auditor;
- custom scripts for the core protocol.

A future version may add:

- deterministic schema validation;
- Artifact naming helpers;
- improved workflow automation;
- optional Research Auditor support;
- additional real-world examples.

---

## Pressure tests

V1 was designed against eight pressure-test categories:

1. simple fact verification;
2. oversized Master context;
3. conflicting sources;
4. no-evidence cases;
5. domain-specific source restrictions;
6. overly long Worker results;
7. Worker-history contamination;
8. lightweight Master intake.

The tests focus on whether Research Relay can preserve context isolation without sacrificing research quality.

See [`docs/pressure-tests.md`](docs/pressure-tests.md).

---

## Feedback and Discussions

Research Relay is still early, and real-world feedback is especially valuable.

If you try it, I'd particularly like to know:

- What are you using it for?
- Does the Dispatcher send too much context?
- Is the Result Envelope too long or too short?
- Have you seen old Worker context leak into a new task?
- What should v1.1 improve?

**[→ Join the GitHub Discussions](https://github.com/qq2638622037-glitch/chatgpt-research-relay/discussions)**

---

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

---

## Contributing

Feedback is especially useful around:

- Task Packet fields that are redundant or missing;
- cases where the Dispatcher sends too much context;
- Worker history contamination;
- evidence-policy edge cases;
- Result Envelope length and usefulness;
- real-world workflows where the protocol breaks down.

See [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

## License

MIT License. See [`LICENSE`](LICENSE).

---

**中文说明：** [`README.zh-CN.md`](README.zh-CN.md)
