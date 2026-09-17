# Result Intake Contract

Validate a returned `research-result/v1` envelope before merging it into Master context.

## Expected envelope
```yaml
protocol: research-result/v1
task_id: "..."
status: COMPLETE | PARTIAL | BLOCKED | CONFLICTING | NO_EVIDENCE
confidence: HIGH | MEDIUM | LOW
master_digest: "..."
key_findings: []
conflicts: []
unresolved: []
recommended_next_action: []
artifact_ref: "..."
```

## Intake checks
1. Match `task_id` to the dispatched packet.
2. Reject or quarantine envelopes with the wrong protocol or missing required fields.
3. Check that `master_digest` respects the packet's soft size contract and does not contain a hidden long report.
4. Check status semantics:
   - `COMPLETE`: every decision-critical question is answered; no material unresolved gap remains.
   - `PARTIAL`: useful evidence exists, but at least one decision-critical point remains open.
   - `BLOCKED`: execution could not proceed because a required input, access path, or constraint is missing.
   - `CONFLICTING`: material evidence remains in genuine conflict after bounded verification.
   - `NO_EVIDENCE`: the bounded search found no reliable evidence that answers the task.
5. Require `unresolved` for `PARTIAL`, `BLOCKED`, or `CONFLICTING` unless the reason is completely captured elsewhere.
6. Require a nonempty `artifact_ref` when `artifact_required: true`, except when the Worker explicitly reports that file creation was unavailable and identifies the inline fallback.
7. Do not reinterpret non-COMPLETE results as complete merely to keep the project moving.

## When to read the Evidence Artifact
Default to **not reading it**. Read it when at least one condition applies:
- The user asks for an audit or detailed evidence.
- The status is `CONFLICTING` or the conflict affects a Master decision.
- The status is `PARTIAL` and Master must decide whether the missing evidence is tolerable.
- The digest contradicts known Master facts or another accepted research result.
- The task is high-stakes or unusually accuracy-sensitive and the Master requires direct evidence review.
- The envelope appears protocol-compliant but the reasoning cannot be accepted without source-level inspection.

Do not open the Artifact merely to restate it.

## Artifact resolution order
Apply this only after the gate above says the Artifact should be read.

1. Try the returned `artifact_ref` when it is directly accessible in the current chat.
2. If the direct reference is unavailable and the task used the default chat-file target, derive the deterministic filename `<task_id>_evidence.md` and search ChatGPT Library for that exact filename.
3. Validate any Library candidate before using it:
   - the Artifact title or Task section must contain the same `task_id`;
   - the task/objective must match the dispatched packet closely enough to rule out an unrelated file;
   - if multiple candidates remain plausible, do not guess which revision is authoritative.
4. If a persistent connector reference such as Google Drive was explicitly returned or requested, use it when available.
5. Only after direct access, Library resolution, and any explicit persistent reference fail should Master ask the user to download the Worker Artifact and attach it manually.

Do not treat a bare `sandbox:/mnt/data/...` path as proof that the Artifact is unavailable everywhere. It can be inaccessible cross-chat while the same generated file remains available through Library.

This resolver is state-aware: do not search Library for normal `COMPLETE`, ordinary `PARTIAL`, `BLOCKED`, or `NO_EVIDENCE` intake unless the Artifact-read gate is triggered.

## Master intake note
Keep the Master-facing intake concise. Use this structure when useful:

```text
Research intake - <task_id>
Status: <status> | Confidence: <confidence> | Artifact: not read / reviewed
Accepted update: <one compact decision-relevant synthesis>
Open issue: <none or one compact issue>
Next action: <none / targeted follow-up / inspect artifact / user test>
```

Avoid duplicating all `key_findings` if the `master_digest` already captures them.
