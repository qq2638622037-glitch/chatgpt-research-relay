# Worker Examples

Use only to resolve output behavior. Do not import example facts into real tasks.

## Example A - Complete
```yaml
protocol: research-result/v1
task_id: RR-20260917-A1B2C3
status: COMPLETE
confidence: HIGH
master_digest: "Current first-party documentation directly answers both requested availability questions. The supported platforms are explicitly listed, and no material contradictory current source was found within scope. The Master can treat the documented support state as current for this decision; details and source provenance are in the Artifact."
key_findings:
  - "Official documentation confirms current availability."
  - "The requested platform support is explicitly documented."
  - "No material current contradiction was found within the defined scope."
conflicts: []
unresolved: []
recommended_next_action:
  - "No further research required for the stated decision use."
artifact_ref: "RR-20260917-A1B2C3_evidence.md"
```

## Example B - Conflicting
```yaml
protocol: research-result/v1
task_id: RR-20260917-G7H8J9
status: CONFLICTING
confidence: HIGH
master_digest: "Two current admissible sources disagree on the decision-critical behavior, and the difference could not be resolved within the allowed refinement rounds. The conflict itself is well established, so the Master should not merge either side as settled fact yet."
key_findings:
  - "Source A directly supports behavior X."
  - "Source B directly supports incompatible behavior Y."
conflicts:
  - "The two sources appear to describe the same current version but disagree on the core behavior."
unresolved:
  - "Which behavior applies in the target environment."
recommended_next_action:
  - "Inspect the Artifact and perform a targeted user test or seek a stronger first-party source."
artifact_ref: "RR-20260917-G7H8J9_evidence.md"
```

## Example C - Blocked by missing required file
Do not search from memory when the packet says a specific prior artifact is required but it is unavailable. Return `BLOCKED`, name the missing artifact, and preserve any non-dependent work only if it is clearly separable.
