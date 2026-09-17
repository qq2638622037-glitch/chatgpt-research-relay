# Changelog

All notable changes to Research Relay will be documented here.

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
