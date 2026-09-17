# Evidence Artifact Contract

Create one detailed Artifact per Task Packet unless the packet explicitly requests another structure.

## Preferred filename
`<task_id>_evidence.md`

Preserve this exact deterministic filename whenever practical. It is not only a local filename: when a generated Worker chat file is persisted by ChatGPT Library, the filename becomes the stable lookup key a later Master audit can use across chats or projects.

Use the packet's requested `artifact_target`:

- For the default `chat_file`, create the Markdown file in the Worker chat. Do not assume a `sandbox:/mnt/data/...` path is durable across chats or projects.
- If the host exposes a durable Library/file reference, it may be returned as `artifact_ref`.
- If no durable reference is exposed, return the deterministic filename `<task_id>_evidence.md` as `artifact_ref`; do not fabricate a Library ID or other persistent handle.
- If the target is optional Google Drive and Drive is unavailable, fall back to a chat file without blocking the research.
- If file creation is unavailable entirely, render the Artifact inline in the Worker chat, label the fallback clearly, and set `artifact_ref` to that clearly identified inline location.

## Required structure
```markdown
# <TASK_ID> - Research Evidence Artifact

## 1. Task
## 2. Executive Finding
## 3. Scope & Method
## 4. Question-by-Question Findings
## 5. Evidence Table
## 6. Contradictions / Competing Evidence
## 7. Negative / Missing Evidence
## 8. Unresolved Questions
## 9. Suggested Follow-up / User Test
## 10. Source Index
```

Adapt section depth to task complexity, but preserve the audit trail.

## Evidence table
Use a compact table such as:

| Claim | Claim Type | Source | Source Type | Date/Version | Supports/Contradicts | Strength | Notes |
|---|---|---|---|---|---|---|---|

Use `Strength` to describe evidence strength, not rhetorical confidence. Suggested values: `DIRECT`, `STRONG`, `MODERATE`, `WEAK`.

## Artifact content rules
- Put full provenance and detailed findings here, not in the Master Digest.
- Record material conflicting evidence even when the final answer favors one interpretation.
- Record required sources that were inaccessible or absent.
- Separate source facts from Worker inference.
- Do not include hidden chain-of-thought or a transcript of internal reasoning.
- Do not pad the Artifact with every search result; retain evidence useful for audit, reproduction, or future follow-up.
