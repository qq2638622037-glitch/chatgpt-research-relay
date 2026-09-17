# Result Envelope Contract — research-result/v1

Return this after creating the Evidence Artifact.

```yaml
protocol: research-result/v1
task_id: "RR-..."
status: COMPLETE | PARTIAL | BLOCKED | CONFLICTING | NO_EVIDENCE
confidence: HIGH | MEDIUM | LOW
master_digest: "Decision-relevant synthesis within the packet's requested size."
key_findings:
  - "..."
conflicts: []
unresolved: []
recommended_next_action:
  - "No action / targeted follow-up / user test / inspect artifact"
artifact_ref: "File, Drive reference, project source, or clearly identified inline fallback"
```

## Status semantics

- `COMPLETE`: Answer every decision-critical question with sufficient admissible evidence; leave no material unresolved gap.
- `PARTIAL`: Produce useful supported findings but leave at least one decision-critical point unresolved.
- `BLOCKED`: Lack a required input, access path, or prerequisite needed to execute the task faithfully.
- `CONFLICTING`: Find material competing evidence that remains unresolved after allowed refinement.
- `NO_EVIDENCE`: Find no reliable evidence that answers the core question within the defined scope and budget.

## Confidence semantics

Measure confidence in the reported research state, not optimism about the claim.

- `HIGH`: Strongly supported account of the result state, including a well-established conflict or well-supported negative finding when applicable.
- `MEDIUM`: Useful evidence exists but relies on some indirect support, minor gaps, or limited coverage.
- `LOW`: Evidence is weak, stale, sparse, or heavily inference-dependent.

## Length rules

- Keep `master_digest` within `master_digest_max_chars` when practical.
- Keep `key_findings` to roughly 3–7 decision-relevant items unless the packet clearly needs fewer.
- Put detailed argumentation, source lists, and evidence tables in the Artifact.
- Keep `conflicts` and `unresolved` limited to items that can change the Master's decision or require follow-up.

## Integrity rules

- Never use `COMPLETE` when a required source was unavailable and the missing source could materially change the answer.
- Never suppress a material contradiction to achieve a cleaner digest.
- Never fabricate an `artifact_ref`.
