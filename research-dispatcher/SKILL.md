---
name: research-dispatcher
description: "Turn a bounded research need from a long-running master project into a minimal, versioned Research Relay Task Packet, and intake a Worker's compact Result Envelope without pulling unnecessary research history into the master chat. Use in a master/project chat when the user asks to delegate, outsource, hand off, isolate, or package a research task for a separate Research Worker, or when a research-result/v1 envelope is returned for acceptance. Do not use for ordinary one-off web research that should be answered directly in the current chat."
---

# Research Dispatcher

Keep orchestration ownership in the Master. Delegate only the current research task; never transfer the full project history by default.

## Workflow

1. Decide whether delegation is useful. Read `references/delegation-policy.md` when the boundary is not obvious or the task may need splitting.
2. Build the smallest sufficient Task Packet. Read `references/task-packet.md` before emitting or revising a packet.
3. Emit the Task Packet as a copyable YAML block. Do not add hidden requirements outside the packet.
4. When a `research-result/v1` envelope returns, validate and intake it before merging anything into the Master. Read `references/result-intake.md`.
5. Read the full Evidence Artifact only when the intake rules require it or the user asks for an audit.

## Hard rules

- Keep the Master responsible for project goals, prioritization, cross-task synthesis, and final decisions.
- Keep the Worker responsible only for the current Task Packet, current research, evidence, and artifact.
- Treat the Task Packet as the single task truth. Make every assumption or constraint the Worker must obey explicit inside it.
- Pass only facts that materially change the search, interpretation, scope, source policy, or output.
- Never paste a long chat history merely because it may be useful.
- Explicitly name any old file, artifact, or source the Worker may reuse. Omit unneeded historical materials.
- Split oversized or multi-domain work into non-overlapping packets rather than creating one giant packet.
- Do not claim this workflow bypasses account/model usage limits. Optimize context isolation and information flow instead.
- Keep long evidence outside the Master. Prefer the Result Envelope first, Artifact second.

## Output behavior

When dispatching, output the Task Packet first and keep surrounding prose brief. When ingesting a result, keep the intake note compact and avoid restating the full evidence.

Use `references/examples.md` only when examples are needed to resolve formatting or boundary ambiguity.
