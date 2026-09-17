# Installation

Research Relay uses two ChatGPT Skills:

- `research-dispatcher` for the Master Project
- `research-worker` for a separate Research Worker Project

## Download

Open the latest GitHub Release and download both release assets:

- `research-dispatcher-v1.1.0.zip`
- `research-worker-v1.1.0.zip`

The release ZIP files can be uploaded to ChatGPT Skills directly. Live installation testing confirmed that they do not need to be renamed to `skill.zip` and do not need to be re-compressed first.

## Install in ChatGPT

1. Open the ChatGPT Skills library.
2. Upload the Dispatcher release ZIP and install it.
3. Upload the Worker release ZIP and install it.
4. Create or choose a long-running Master Project and use `research-dispatcher` there.
5. Create a separate Research Worker Project and use `research-worker` there.

Using separate project contexts is recommended because Research Relay's Context Firewall assumes the Master owns long-term project state while the Worker receives only the current Task Packet.

## First run

1. In the Master Project, ask `research-dispatcher` to package one bounded research question.
2. Copy the resulting `research-task/v1` Task Packet into a fresh Worker chat.
3. Let `research-worker` research the packet and create an Evidence Artifact plus a compact `research-result/v1` Result Envelope.
4. Copy only the Result Envelope back to the Master first.
5. Let `research-dispatcher` perform intake.

Normal `COMPLETE` results usually do not require the Master to open the Evidence Artifact.

## Artifact transport in v1.1

The default Artifact target remains `chat_file`.

Worker Evidence Artifacts use the deterministic filename:

```text
<task_id>_evidence.md
```

When an audit is required, such as for `CONFLICTING`, the Dispatcher first tries the returned `artifact_ref`. If a direct Worker-chat reference is unavailable across chats or projects, it can use the deterministic filename to resolve the generated Artifact through ChatGPT Library.

Before accepting a Library match, the Dispatcher verifies the Artifact's `task_id` and task/objective so an older or unrelated file is not silently reused.

Manual download and re-upload remains the final fallback only after direct access, Library resolution, and any explicitly configured persistent connector reference fail.

This Library resolver is state-aware. It does not cause ordinary `COMPLETE`, routine `PARTIAL`, `BLOCKED`, or `NO_EVIDENCE` intake to search old Artifacts unless the Artifact-read gate is independently triggered.

## Optional Google Drive

Google Drive is not required for Research Relay v1.1. A future automation workflow may use a persistent connector or shared store, but the public Skills must remain usable without making Drive a hidden dependency.

## Validated v1.1 regression paths

The v1.1 candidate was tested with the following live paths before release preparation:

- installation of both updated Skills;
- normal `COMPLETE` intake with no Artifact read and no Library resolver call;
- `CONFLICTING` intake where a cross-Project Worker Artifact was recovered through Library without manual user transfer;
- Worker Context Firewall verification with `artifact_inputs: []` and overlapping historical research present in Library.

The five existing result states remain:

- `COMPLETE`
- `PARTIAL`
- `BLOCKED`
- `CONFLICTING`
- `NO_EVIDENCE`

## Requirements

- ChatGPT Projects
- ChatGPT Skills
- two separate project contexts are recommended

Not required:

- ChatGPT Work
- Codex
- Google Drive
- an external Agent runtime
- a self-hosted server
