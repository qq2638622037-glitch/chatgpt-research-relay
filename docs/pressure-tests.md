# Research Relay V1 — Build & Pressure Test Report

Date: 2026-09-17

## 1. Build scope

V1 contains two independent ChatGPT Skills:

- `research-dispatcher`: runs in the Master environment; creates minimal Task Packets and intakes Result Envelopes.
- `research-worker`: runs in the Research Worker environment; executes a Task Packet, creates an Evidence Artifact, and returns a short Result Envelope.

V1 intentionally excludes:

- Auditor / third Skill;
- custom scripts;
- mandatory Google Drive dependency;
- automatic creation of a true isolated subagent/runtime;
- project-specific Roco/PVP rules hard-coded into the core Skill.

## 2. Frozen protocols

### Task Packet

Protocol: `research-task/v1`

Core fields:

- `task_id`
- `objective`
- `decision_use`
- `known_facts`
- `questions`
- `scope`
- `constraints`
- `artifact_inputs`
- `source_policy`
- `research_budget`
- `output_contract`
- `stop_conditions`

Important V1 addition: `artifact_inputs` is explicit. Prior Worker history is not implicitly authorized context.

### Result Envelope

Protocol: `research-result/v1`

Statuses:

- `COMPLETE`
- `PARTIAL`
- `BLOCKED`
- `CONFLICTING`
- `NO_EVIDENCE`

Core fields:

- `task_id`
- `status`
- `confidence`
- `master_digest`
- `key_findings`
- `conflicts`
- `unresolved`
- `recommended_next_action`
- `artifact_ref`

### Evidence Artifact

Preferred filename: `<task_id>_evidence.md`

Detailed evidence, source provenance, contradictions, negative evidence, unresolved questions, and explicit inference are kept here rather than expanded into the Master chat.

## 3. Pressure Test results — design/static pass

| Test | Result | V1 mechanism |
|---|---|---|
| A. Simple fact check | PASS | Dispatcher does not force delegation for trivial tasks; Worker supports `light` depth and early stop. |
| B. Long Master project | PASS | Minimal-context test + Context Firewall + explicit `artifact_inputs`. |
| C. Conflicting sources | PASS | `CONFLICTING` status, conflict preservation, bounded refinement. |
| D. No evidence | PASS | `NO_EVIDENCE`; tool failure is explicitly distinguished from no evidence. |
| E. Domain-specific rules | PASS | `constraints`, `source_policy.required/forbidden/freshness`; no domain hard-coding needed. |
| F. Worker result becomes too long | PASS | Full content goes to Evidence Artifact; Result Envelope has a digest size contract. |
| G. Worker historical contamination | PASS | Prior Worker chats/project memory are forbidden as task facts unless explicitly authorized. |
| H. Master intake | PASS | Master defaults to not reading the Artifact; escalation conditions are explicit. |

This is a design/static pressure test, not yet a live installed-Skill behavioral test. The next validation step is to install both Skills and run real Master -> Worker -> Master transfers.

## 4. Validation and packaging

Both Skill folders passed `quick_validate.py` and the official `package_skill.py` validation.

Final installation artifacts:

- Dispatcher: `dist/dispatcher/skill.zip`
- Worker: `dist/worker/skill.zip`

No example scripts or unused asset files remain in either package.

## 5. Recommended first live test

Use one real but bounded task from an existing long project. Recommended order:

1. In Master, ask Dispatcher to create a Task Packet for one narrow research question.
2. Copy only that Packet into a fresh Worker chat in the Worker Project.
3. Let Worker research and return an Evidence Artifact + Result Envelope.
4. Copy only the Result Envelope back to Master.
5. Ask Dispatcher to intake it without opening the Artifact.
6. Check whether Master still has enough information to make the intended decision.
7. Only then test conflict, no-evidence, and historical-contamination cases.

## 6. V1 known limitations

- Skills do not themselves create a true isolated agent runtime in this design; isolation is achieved operationally through separate Projects/chats plus the protocol.
- Cross-Project transfer is manual in V1 unless a later connector-based queue is deliberately added.
- Google Drive remains optional and is not a single point of failure.
- Auto-trigger quality and exact digest length should be tuned after live usage.
- Auditor remains deferred to V1.1/V2.

## 7. Current conclusion

V1 is ready for installation and live workflow testing. Architecture, protocols, references, validation, and packaging are complete for the first usable build.
