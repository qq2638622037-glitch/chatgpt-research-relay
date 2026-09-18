# Changelog

All notable changes to Research Relay will be documented here.

## [1.1.0] - 2026-09-18

### Added

- State-aware Evidence Artifact resolution in `research-dispatcher`.
- ChatGPT Library fallback for audit-required Artifact intake when a direct Worker-chat reference is unavailable.
- Deterministic `<task_id>_evidence.md` Artifact lookup and task-identity validation before intake.
- Explicit Worker Task Packet validation for `decision_use`, `known_facts.status`, `constraints`, and `stop_conditions`.
- Installation guidance based on live ChatGPT Skills installation tests.

### Changed

- `research-worker` now treats the deterministic Evidence Artifact filename as the default cross-chat lookup key when no durable file reference is exposed.
- A bare `sandbox:/mnt/data/...` path is no longer treated as the only Artifact locator.
- `CONFLICTING` and other audit-gated paths can fall back to Library before asking the user for manual file transfer.
- Normal `COMPLETE`, ordinary `PARTIAL`, `BLOCKED`, and `NO_EVIDENCE` intake remains Result-Envelope-first and does not search Library unless the Artifact-read gate is triggered.

### Validated

- Original release-style Skill ZIP installation in ChatGPT.
- `COMPLETE` Envelope-only intake without Artifact or Library access.
- `CONFLICTING` cross-Project Artifact recovery through ChatGPT Library without manual download/upload.
- Worker Context Firewall with `artifact_inputs: []` despite overlapping historical Library Artifacts.
- Existing `COMPLETE`, `PARTIAL`, `BLOCKED`, `CONFLICTING`, and `NO_EVIDENCE` status semantics remain unchanged.

## [1.0.0] - 2026-09-17

### Added

- Initial `research-dispatcher` Skill.
- Initial `research-worker` Skill.
- `research-task/v1` Task Packet protocol.
- `research-result/v1` Result Envelope protocol.
- Evidence Artifact contract.
- Explicit `COMPLETE`, `PARTIAL`, `BLOCKED`, `CONFLICTING`, and `NO_EVIDENCE` states.
- Explicit `artifact_inputs` allowlist to reduce Worker-history contamination.
- Bounded research and stop-condition rules.
- Initial pressure-test suite and build report.
