# Architecture

Research Relay separates long-running project orchestration from bounded research execution.

## Roles

### Master

Owns project goals, long-term context, prioritization, task decomposition, cross-task synthesis, and final decisions.

### Dispatcher

Creates the smallest sufficient versioned Task Packet for a bounded research task and later validates the returned Result Envelope.

### Worker

Acts as a pure research leaf. It receives the Task Packet, performs only the assigned research, writes detailed evidence to an Artifact, and returns a concise Result Envelope.

## Context Firewall

The Worker does not receive the full Master history by default. The Task Packet is the current task's single source of truth.

Previously created artifacts are reusable only when explicitly listed as allowed inputs. This prevents a Worker Project's older chats from silently becoming business facts for a new task.

## Artifact-first flow

Long evidence belongs in an external artifact or file. The Master reads the compact Result Envelope first and opens the full Artifact only when needed for audit or deeper review.

## Failure model

Research may finish as COMPLETE, PARTIAL, BLOCKED, CONFLICTING, or NO_EVIDENCE. A task is never promoted to COMPLETE merely to make the workflow look finished.
