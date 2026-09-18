# Research Relay Bridge v1.2 — Technical Specification

**Status:** Stage 3A technical specification  
**Target branch:** `v1.2-browser-relay-bridge`  
**Baseline:** Research Relay v1.1.0 remains frozen and stable  
**Implementation target:** WXT + TypeScript, Chromium first (Edge / Chrome)  
**Bridge prototype version:** `0.1.0-alpha.1`

---

## 1. Purpose

Research Relay Bridge removes the two manual copy/paste hops in the existing Master ↔ Worker workflow without weakening the v1.1 Context Firewall.

The Bridge is a browser-local transport and validation layer. It is not a research agent, does not replace either Skill, does not read old Worker history, and does not move Evidence Artifacts into the Master conversation.

Normative terms in this document use **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** in their ordinary specification sense.

---

## 2. Frozen v1.1 compatibility baseline

The Bridge MUST preserve the existing v1.1 contracts:

- Master Skill: `research-dispatcher`
- Worker Skill: `research-worker`
- Task protocol: `research-task/v1`
- Result protocol: `research-result/v1`
- Result states:
  - `COMPLETE`
  - `PARTIAL`
  - `BLOCKED`
  - `CONFLICTING`
  - `NO_EVIDENCE`
- Task Packet remains the single task truth.
- A fresh Worker Chat is required for every independent `task_id`.
- Result Envelope remains the normal Master return surface.
- Evidence Artifact remains outside the ordinary Relay path.
- Library Resolver remains an Artifact audit/recovery mechanism only.
- Manual v1.1 copy/paste MUST remain fully usable when the Bridge is disabled or broken.

The Bridge MUST adapt to the Skills. The Skills MUST NOT be redesigned around extension-specific metadata.

---

## 3. MVP goals

The first v1.2 Bridge MUST support:

1. Detect a valid `research-task/v1` YAML code block in ChatGPT Web.
2. Render an inline **Send to Worker** control bound to that exact block.
3. Validate the Task Packet deterministically before starting a relay.
4. Save the exact Master Chat URL and task identity.
5. Open the registered Worker Project entry URL.
6. Establish and verify a Fresh Worker Chat.
7. Stage the Task Packet in the Worker composer.
8. Require the user to perform the final Send action.
9. Detect the actually posted Task Packet and validate that it still matches the active relay identity.
10. Detect a valid `research-result/v1` block for the active task.
11. Render **Return to Master** only for a matching active relay.
12. Validate the Result Envelope and `task_id`.
13. Reopen/focus the original Master Chat.
14. Stage the Result Envelope in the Master composer.
15. Require the user to perform the final Send action.
16. Recover the active relay after an MV3 service-worker sleep or browser restart.
17. Fail closed when Fresh Chat proof, protocol validation, locator lookup, or task identity cannot be established.

---

## 4. Non-goals for v1.2 MVP

The Bridge MUST NOT:

- perform web research;
- summarize or rewrite Task/Result semantics;
- automatically repair malformed YAML;
- choose research status;
- open or inspect Evidence Artifacts in the normal path;
- search old Worker chats;
- search Library for old task evidence;
- use OpenAI API;
- require ChatGPT Work;
- require a server;
- require a local Native Companion;
- auto-click final Send;
- become a general browser RPA/recorder;
- scrape arbitrary websites;
- request `<all_urls>`;
- read cookies, browsing history, or system clipboard as the normal transport path;
- support concurrent active relays in the MVP.

---

## 5. Repository placement

The extension is a sibling of the two Skills:

```text
chatgpt-research-relay/
├── research-dispatcher/
├── research-worker/
├── research-relay-bridge/
│   ├── package.json
│   ├── wxt.config.ts
│   ├── vitest.config.ts
│   ├── entrypoints/
│   │   ├── background.ts
│   │   ├── content.ts
│   │   └── popup/
│   └── src/
│       ├── adapters/chatgpt/
│       ├── protocol/
│       ├── relay/
│       ├── storage/
│       ├── messaging/
│       └── ui/
└── docs/
```

All unstable ChatGPT DOM knowledge MUST remain under `src/adapters/chatgpt/`.

---

## 6. Browser and framework target

### 6.1 Initial browser target

Blocking targets:

- Microsoft Edge (Chromium)
- Google Chrome

Firefox compatibility MAY be kept architecturally possible but is not a Stage 4/5 blocking target.

### 6.2 Framework

Use:

- WXT
- TypeScript
- Manifest V3
- Vitest for unit tests
- `yaml` for YAML parsing
- `zod` for structural validation

A package lockfile MUST be committed before the first user-facing test bundle is treated as reproducible. Until that lockfile is committed, CI may use `npm install`, but the missing lockfile remains an explicit pre-E2E cleanup item rather than a silent assumption.

---

## 7. Manifest and permission baseline

The first build SHOULD attempt the minimum manifest:

- required extension permission: `storage`
- host scope: `https://chatgpt.com/*`
- manifest-registered content script for ChatGPT

Do **not** request `tabs` or `scripting` in the initial implementation unless real testing proves they are required.

Rationale:

- Chromium's Tabs API allows basic tab creation/navigation without the sensitive `tabs` permission.
- Matching host permission can provide access needed for ChatGPT tabs.
- Manifest-registered content scripts do not require dynamic `scripting.executeScript()`.

If a new permission becomes necessary, the implementation change MUST document:

1. the exact failing operation;
2. why current host permission is insufficient;
3. the smallest additional permission that solves it;
4. the user-visible permission impact.

---

## 8. Local-only data model

### 8.1 BridgeConfig

```ts
interface BridgeConfig {
  schemaVersion: 1
  workerEntryUrl?: string
  configuredAt?: string
}
```

`workerEntryUrl` is the exact ChatGPT URL captured when the user chooses **Set current project as Worker**.

The Bridge MUST NOT invent or hard-code a user's Worker Project URL.

### 8.2 ActiveRelay

```ts
interface ActiveRelay {
  schemaVersion: 1
  taskId: string
  state: RelayState

  masterUrl: string
  workerEntryUrl: string
  workerChatUrl?: string

  taskPacket: string
  taskHash: string

  resultEnvelope?: string
  resultHash?: string

  createdAt: string
  updatedAt: string

  masterTabIdHint?: number
  workerTabIdHint?: number

  lastError?: RelayError
}
```

Tab IDs are ephemeral hints only. URLs are the durable recovery locator.

### 8.3 RelayError

```ts
interface RelayError {
  code: RelayErrorCode
  stage: RelayState | 'VALIDATION' | 'ADAPTER'
  message: string
  recoverable: boolean
  occurredAt: string
  locatorAttempts?: string[]
}
```

Error diagnostics MUST NOT include complete Task/Result payloads by default.

### 8.4 Recent terminal metadata

The Bridge MAY retain at most the most recent 20 terminal relay records:

```ts
interface RelayHistoryItem {
  taskId: string
  terminalState: 'DONE' | 'CANCELLED'
  completedAt: string
  lastErrorCode?: string
}
```

Do not retain complete Task or Result text in completed history.

---

## 9. Storage rules

Durable state MUST use `chrome.storage.local` / WXT local storage.

The service worker MUST NOT treat module globals as authoritative state.

Suggested keys:

```text
local:bridgeConfig
local:activeRelay
local:relayHistory
```

Writes MUST be serialized by the relay controller so two clicks cannot race conflicting state transitions.

On extension startup/reload:

1. load `bridgeConfig`;
2. load `activeRelay`;
3. validate stored schema version;
4. expose **Resume** if a non-terminal active relay exists;
5. never guess a missing transition.

---

## 10. Protocol block representation

A detected block is runtime data, not persistent DOM state:

```ts
interface ProtocolBlock {
  kind: 'task' | 'result'
  rawYaml: string
  normalizedYaml: string
  taskId: string
  hash: string
  valid: boolean
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
  element: HTMLElement
}
```

The DOM element reference MUST never be stored in extension storage.

---

## 11. Protocol block detection

The content script MUST inspect code/preformatted blocks, not the whole page as a single text blob.

Candidate rule:

- Task candidate contains `protocol: research-task/v1`.
- Result candidate contains `protocol: research-result/v1`.

The candidate MUST then pass YAML parsing and schema validation before a Relay action is enabled.

Rules:

- A button is bound to one concrete code block.
- Multiple valid packets on the page are allowed.
- Never assume the newest or last packet is the correct one.
- Do not scan unrelated page history to construct task context.
- Ignore protocol-looking text inside the composer.
- Injection MUST be idempotent; the same DOM block receives at most one Bridge control mount.

### 11.1 DOM observation

Use one scoped, debounced observation mechanism for ChatGPT's SPA updates.

It MUST:

- debounce rescans;
- rescan only changed/new subtrees when practical;
- avoid recursive observer creation;
- avoid polling loops with no upper bound;
- disconnect/rebind when the conversation root is replaced.

A full-document MutationObserver that repeatedly rescans the entire page on every mutation is not acceptable.

---

## 12. YAML parser safety

Protocol parsing treats page content as untrusted input.

Parser rules:

- accept exactly one YAML document;
- use YAML 1.2/core semantics;
- require unique mapping keys;
- reject aliases/anchors by setting the alias budget to zero;
- reject parser errors;
- reject custom semantics that cannot be represented as plain JSON-like data;
- do not execute or evaluate any YAML value;
- impose a maximum protocol block size of 256 KiB;
- never auto-repair malformed YAML.

The original `rawYaml` MUST remain unchanged for transport after validation.

---

## 13. Task schema — `research-task/v1`

The Bridge performs transport validation, not research-semantic judgment.

Hard requirements:

- `protocol === "research-task/v1"`
- non-empty `task_id`
- non-empty `objective`
- non-empty `decision_use`
- `known_facts` array
- `questions` non-empty array
- `scope.include` array
- `scope.exclude` array
- `constraints` array
- `artifact_inputs` array
- `source_policy.priority` array
- `source_policy.required` array
- `source_policy.forbidden` array
- string `source_policy.freshness`
- `research_budget.depth` in `light | standard | deep`
- non-negative integer `research_budget.max_refinement_rounds`
- boolean `output_contract.artifact_required`
- non-empty `output_contract.artifact_target`
- positive integer `output_contract.master_digest_max_chars`
- boolean `output_contract.expose_conflicts`
- boolean `output_contract.expose_uncertainty`
- `stop_conditions` non-empty array

`known_facts[*].status` when present MUST be one of:

- `confirmed`
- `user_observation`
- `working_assumption`

`artifact_inputs[*]` MUST contain:

- non-empty `ref`
- non-empty `purpose`
- boolean `required`

Unknown extra keys MAY be preserved and transported. The Bridge MUST NOT delete or normalize them away.

---

## 14. Result schema — `research-result/v1`

Hard requirements:

- `protocol === "research-result/v1"`
- non-empty `task_id`
- `status` in the five frozen states
- `confidence` in `HIGH | MEDIUM | LOW`
- non-empty `master_digest`
- `key_findings` array
- `conflicts` array
- `unresolved` array
- `recommended_next_action` array
- non-empty `artifact_ref`

For a live relay:

```text
result.task_id MUST equal activeRelay.taskId
```

Mismatch is a hard, fail-closed error.

The Bridge MUST NOT reinterpret result status semantics and MUST NOT open `artifact_ref` automatically.

---

## 15. Validation severity

Use two levels:

### Hard error

Blocks the Relay action.

Examples:

- invalid YAML;
- wrong protocol;
- missing required field;
- wrong type;
- invalid enum;
- packet larger than size limit;
- result `task_id` mismatch.

### Warning

Does not modify or repair the payload.

Examples:

- unknown additional key;
- unusually long digest;
- a valid but unusual optional extension field.

Warnings MUST be shown without silently rewriting the block.

---

## 16. Hashing and idempotency

Hashes are for identity/idempotency, not security.

Normalization before hashing:

1. convert CRLF/CR to LF;
2. remove leading/trailing blank lines;
3. preserve all internal text exactly;
4. UTF-8 encode;
5. SHA-256 via Web Crypto.

```text
taskHash   = SHA256(normalized task YAML)
resultHash = SHA256(normalized result YAML)
```

Do not hash a reserialized YAML object because serialization may reorder or restyle user/model text.

---

## 17. Durable relay states

```ts
type RelayState =
  | 'TASK_VALIDATED'
  | 'WORKER_OPENING'
  | 'WORKER_READY'
  | 'TASK_STAGED'
  | 'AWAITING_RESULT'
  | 'RESULT_VALIDATED'
  | 'MASTER_OPENING'
  | 'MASTER_READY'
  | 'RESULT_STAGED'
  | 'NEEDS_USER_NEW_CHAT'
  | 'ERROR_RECOVERABLE'
  | 'DONE'
  | 'CANCELLED'
```

`TASK_CAPTURED` and `RESULT_CAPTURED` are transient validation events, not durable active-relay states. Invalid content MUST NOT become a persisted active relay.

---

## 18. State-transition contract

Normal path:

```text
IDLE
  -> TASK_VALIDATED
  -> WORKER_OPENING
  -> WORKER_READY
  -> TASK_STAGED
  -> AWAITING_RESULT
  -> RESULT_VALIDATED
  -> MASTER_OPENING
  -> MASTER_READY
  -> RESULT_STAGED
  -> DONE
```

Recoverable side path:

```text
WORKER_OPENING / WORKER_READY
  -> NEEDS_USER_NEW_CHAT
  -> WORKER_READY
```

Any non-terminal state MAY enter `ERROR_RECOVERABLE` when the error has a deterministic resume action.

Any active relay MAY be explicitly cancelled by the user.

Every transition MUST define:

- allowed source state(s);
- guard conditions;
- storage update;
- side effect;
- rollback/recovery behavior.

A state transition MUST be idempotent. Repeating an action MUST NOT spawn unbounded duplicate tabs or duplicate composer injection.

---

## 19. Single-active-relay rule

MVP allows one active relay.

When **Send to Worker** is clicked:

- If no relay exists: start it.
- If the same `taskId + taskHash` relay already exists: focus/resume it.
- If another active relay exists: block the new relay and show the existing task ID with **Resume** and **Cancel** actions.
- Never silently replace an active relay.

---

## 20. Worker Project registration

Setup flow:

```text
Open the intended Research Worker Project in ChatGPT
-> open Bridge popup
-> Set current project as Worker
-> Bridge stores the exact current ChatGPT URL as workerEntryUrl
```

Rules:

- Setup action is allowed only on the approved ChatGPT origin.
- Store the actual URL exposed by the host.
- Do not synthesize project IDs.
- Do not read the Worker Project's old messages.
- Registration alone does not prove that the current chat is fresh.

The popup SHOULD show the configured origin/path in a privacy-preserving abbreviated form.

---

## 21. Starting Master -> Worker relay

When the user clicks **Send to Worker** on a valid Task block:

1. Re-read the bound block.
2. Re-parse and re-validate it.
3. Compute `taskHash`.
4. Confirm Worker Project is configured.
5. Confirm there is no conflicting active relay.
6. Persist `TASK_VALIDATED` with:
   - task ID;
   - exact Master URL;
   - exact raw Task YAML;
   - task hash;
   - Worker entry URL.
7. Transition to `WORKER_OPENING`.
8. Reuse/focus a known matching Worker tab when safe; otherwise create a new tab at `workerEntryUrl`.
9. Wait for ChatGPT adapter health.
10. Establish a verifiably fresh Worker Chat.
11. Transition to `WORKER_READY`.
12. Stage the Task text in the composer.
13. Transition to `TASK_STAGED`.
14. Stop before final Send.

---

## 22. Fresh Worker Chat proof

Fresh Chat is a security/context requirement, not a cosmetic convenience.

`openFreshChat()` MUST return an explicit proof result:

```ts
interface FreshChatProof {
  verified: boolean
  signals: string[]
  reason?: string
}
```

The Bridge MUST NOT inject the Task unless it can verify a fresh conversation using adapter-observable evidence.

Acceptable signals MAY include:

- the New Chat action was activated through an approved locator;
- the conversation route changed into a new/blank conversation state;
- the transcript area contains no prior user/assistant turns;
- the expected Worker project shell remains active;
- the composer is ready in that blank context.

The initial adapter SHOULD require more than one independent positive signal when possible.

If proof fails:

```text
state -> NEEDS_USER_NEW_CHAT
```

Then:

- do not inject into the old chat;
- instruct the user to create a New Chat manually;
- detect the verified blank composer;
- continue from `WORKER_READY`.

---

## 23. Composer injection

The adapter MUST stage text through the supported editable surface and dispatch the necessary input/change events.

It MUST NOT:

- use `innerHTML` to inject arbitrary markup;
- click Send;
- append to a non-empty composer without explicit confirmation;
- overwrite user-authored composer text silently.

Default staged representation:

~~~~text
```yaml
<exact validated YAML payload>
```
~~~~

The YAML payload inside the fence MUST be the validated raw protocol block.

If the composer is non-empty, staging MUST stop and request the user to clear it or explicitly replace it.

---

## 24. Human-confirmed Send and posted-message verification

Human confirmation is not considered complete merely because text was placed in the composer.

After `TASK_STAGED`:

- the Bridge waits for a newly posted user message containing `research-task/v1`;
- re-extracts the actually posted YAML;
- re-validates it;
- requires the same `task_id`.

If the user edited the staged text before Send but the posted packet remains valid with the same `task_id`, the Bridge MAY update `taskPacket` and `taskHash` to the actually posted version.

If the posted packet is malformed or changes `task_id`, transition to `ERROR_RECOVERABLE` and do not bind later Worker results to that relay automatically.

Only after a valid posted task is observed:

```text
TASK_STAGED -> AWAITING_RESULT
```

This prevents a false-positive relay state when a user edits, clears, or never sends the staged packet.

---

## 25. Result detection and Worker -> Master return

While an active relay is `AWAITING_RESULT`:

1. detect valid `research-result/v1` code blocks;
2. validate each candidate;
3. enable **Return to Master** only when `task_id === activeRelay.taskId`;
4. clicking the control re-reads and re-validates the exact block;
5. compute `resultHash`;
6. persist `resultEnvelope` and `RESULT_VALIDATED`;
7. open/focus the exact saved Master Chat URL;
8. wait for ChatGPT adapter health;
9. transition `MASTER_READY`;
10. stage the Result Envelope;
11. transition `RESULT_STAGED`;
12. stop before final Send.

After the user sends, the Bridge SHOULD verify the actually posted Master message contains a valid matching Result Envelope before transitioning to `DONE`.

If the Master tab was closed, reopen the saved exact URL.

If the saved URL cannot be opened, retain `resultEnvelope` and expose **Resume**; never discard the Result.

---

## 26. ChatGPTAdapter boundary

Only `src/adapters/chatgpt/` may contain ChatGPT selectors and DOM behavior.

Required interface:

```ts
interface ChatGPTAdapter {
  healthCheck(): Promise<AdapterHealth>
  findProtocolBlocks(root?: ParentNode): ProtocolBlockCandidate[]
  getComposer(): Promise<HTMLElement | null>
  readComposer(): Promise<string>
  injectComposer(text: string): Promise<AdapterActionResult>
  findSendButton(): Promise<HTMLElement | null>
  openFreshChat(): Promise<FreshChatProof>
  waitForComposer(timeoutMs: number): Promise<HTMLElement>
  getConversationUrl(): string
  waitForPostedProtocol(
    kind: 'task' | 'result',
    taskId: string,
    timeoutMs: number
  ): Promise<PostedProtocolObservation>
}
```

`findSendButton()` exists for health/diagnostics and later optional automation. MVP MUST NOT invoke it to submit a message.

---

## 27. Locator strategy

Each logical target keeps multiple locators ordered from strongest to weakest:

1. stable semantic/data attribute;
2. ARIA role + accessible label;
3. stable structural relationship;
4. narrowly scoped text fallback;
5. fail closed.

A locator attempt MUST have an identifier for diagnostics, e.g.:

```text
composer.data-testid
composer.role-textbox
composer.structural
```

Forbidden:

- a single long `nth-child(...)` chain;
- random hashed class names as the only locator;
- clicking the first vaguely matching button;
- silent fallback to an unrelated editable element.

---

## 28. Wait, retry, and timeout policy

Every adapter action MUST have:

- a finite timeout;
- a finite retry count;
- short bounded backoff;
- a named failure code.

Suggested MVP defaults:

```text
composer wait:          10 s
navigation shell wait:  15 s
locator retry:           2 additional attempts
retry backoff:           250 ms -> 750 ms
posted-message observe: user-driven; no synthetic Send timeout
```

Timeout constants MUST be centralized.

Do not implement endless `setInterval`, endless polling, or recursive retries.

---

## 29. Extension messaging boundary

Content-script messages MUST be treated as untrusted. Extension-owned UI messages (for example the popup) are a separate trusted sender class and MUST receive a smaller, explicit command allowlist.

The service worker MUST:

1. validate the message shape;
2. classify the sender as ChatGPT content or extension-owned UI;
3. verify ChatGPT content senders belong to the approved ChatGPT host;
4. allow extension-owned UI only for explicitly internal commands;
5. re-validate Task/Result protocol payloads before storing them;
6. enforce FSM transition guards centrally;
7. reject unknown message types;
8. never execute arbitrary URLs supplied by page text.

Worker registration MUST NOT trust a URL string supplied by page content. The popup requests registration of the current active tab; the background queries that active tab itself, verifies the approved ChatGPT origin, and stores the observed URL.

Suggested message types:

```ts
type BridgeMessage =
  | { type: 'GET_STATE' }
  | { type: 'SET_WORKER_ENTRY_CURRENT_TAB' }
  | { type: 'START_RELAY'; rawTask: string; masterUrl: string }
  | { type: 'TASK_POSTED'; rawTask: string; observedUrl: string }
  | { type: 'CAPTURE_RESULT'; rawResult: string }
  | { type: 'RESULT_POSTED'; rawResult: string; observedUrl: string }
  | { type: 'RESUME_RELAY' }
  | { type: 'CANCEL_RELAY' }
```

The page must never be able to send a message that directly sets an arbitrary relay state.

---

## 30. Tab/navigation rules

The background/service worker owns tab coordination.

Rules:

- prefer a known tab ID only as a hint;
- verify any hinted tab still belongs to the approved ChatGPT origin before using it;
- recover by URL when the tab ID is stale;
- opening/focusing a tab MUST be idempotent;
- do not close user tabs automatically;
- do not navigate a non-ChatGPT tab;
- do not navigate a ChatGPT tab that cannot be positively identified as part of the active relay;
- never use a page-provided arbitrary URL as a navigation target.

Authoritative navigation targets are only:

- stored `workerEntryUrl` captured by explicit setup;
- stored `masterUrl` captured when the user started the relay.

---

## 31. Popup responsibilities

MVP popup contains only:

- Bridge version;
- adapter/host health;
- Worker Project registration status;
- active `task_id`;
- current relay state;
- **Set current project as Worker**;
- **Resume**;
- **Cancel**;
- compact last error;
- **Copy diagnostics**.

The popup MUST NOT become a second workflow editor.

---

## 32. Inline controls

Inline controls MUST:

- be visually separate from ChatGPT-native controls;
- identify themselves as Research Relay;
- mount next to the exact validated protocol block;
- disappear/disable when the block becomes invalid;
- show validation errors on demand;
- avoid modifying ChatGPT message text.

Task control:

```text
Send to Worker
```

Result control:

```text
Return to Master
```

A matching Result button appears only when an active relay is expecting that `task_id`.

---

## 33. Security and privacy baseline

MVP MUST be local-first.

It MUST NOT:

- send Task/Result text to a project-owned server;
- add telemetry;
- collect unrelated chat history;
- read cookies;
- read browser history;
- use the system clipboard as a hidden transport channel;
- persist full completed research payloads indefinitely.

The extension stores locally only what is necessary to resume the active relay.

The README/extension UI SHOULD disclose that an active relay temporarily stores:

- task ID;
- current Task Packet;
- current Result Envelope after capture;
- Master/Worker ChatGPT URLs;
- hashes;
- timestamps;
- last relay error.

Cancel/DONE SHOULD clear the full active payload after terminal metadata is recorded.

---

## 34. Diagnostics

Diagnostics MUST be useful without leaking research content by default.

Recommended export:

```json
{
  "bridgeVersion": "...",
  "browser": "...",
  "manifestVersion": 3,
  "state": "...",
  "taskId": "...",
  "adapterHealth": "...",
  "lastErrorCode": "...",
  "locatorAttempts": ["..."],
  "createdAt": "...",
  "updatedAt": "..."
}
```

Do not include:

- Task text;
- Result text;
- full chat URLs containing opaque conversation/project identifiers;

unless the user explicitly requests a full diagnostic export.

---

## 35. Failure codes

At minimum define:

```text
WORKER_NOT_CONFIGURED
INVALID_TASK_YAML
INVALID_TASK_SCHEMA
ACTIVE_RELAY_CONFLICT
WORKER_OPEN_FAILED
ADAPTER_UNHEALTHY
FRESH_CHAT_NOT_VERIFIED
COMPOSER_NOT_FOUND
COMPOSER_NOT_EMPTY
TASK_STAGE_FAILED
POSTED_TASK_INVALID
POSTED_TASK_ID_MISMATCH
RESULT_SCHEMA_INVALID
RESULT_TASK_ID_MISMATCH
MASTER_OPEN_FAILED
RESULT_STAGE_FAILED
POSTED_RESULT_INVALID
STORAGE_READ_FAILED
STORAGE_WRITE_FAILED
```

Each code MUST map to one clear user-facing recovery action.

---

## 36. Recovery semantics

### Worker not configured
Block relay and open setup guidance.

### Worker entry cannot open
Keep active Task and expose Resume.

### Fresh Chat cannot be verified
Enter `NEEDS_USER_NEW_CHAT`; never inject into the old Worker chat.

### Composer unavailable
Retry within bounds, then stop.

### Wrong Result task ID
Do not return it to Master.

### Master URL unavailable
Keep validated Result locally and expose Resume/manual fallback.

### Extension disabled or completely broken
The v1.1 manual copy/paste flow remains the authoritative fallback.

---

## 37. Unit-test requirements

Stage 4 MUST begin with pure unit tests for protocol and FSM before DOM automation expands.

### Protocol tests

Task:

- valid canonical packet;
- empty `known_facts`;
- empty `artifact_inputs`;
- missing `decision_use`;
- wrong protocol;
- invalid known-fact status;
- invalid research depth;
- duplicate YAML key;
- YAML alias;
- oversized block;
- unknown extra field preserved.

Result:

- all five statuses;
- all three confidence values;
- missing `artifact_ref`;
- wrong protocol;
- wrong task ID against active relay;
- unknown extra field preserved.

### Hash tests

- LF vs CRLF normalize to the same hash;
- internal whitespace differences produce a different hash;
- YAML reserialization is not used for identity.

### FSM tests

- happy path;
- illegal transition rejected;
- same start action is idempotent;
- conflicting task blocked;
- cancellation from every non-terminal state;
- resume after recoverable error;
- `NEEDS_USER_NEW_CHAT -> WORKER_READY` only after verified proof;
- wrong result ID cannot advance state.

---

## 38. Adapter fixture tests

DOM adapter tests SHOULD use sanitized local HTML fixtures, not a permanent assumption that production ChatGPT DOM is stable.

At minimum:

- one valid Task block;
- multiple Task blocks;
- valid Result block;
- malformed protocol block;
- composer present;
- composer missing;
- first locator broken, second locator succeeds;
- all locators fail;
- control injection idempotency.

Production selectors MUST be added only after live prototype inspection.

---

## 39. Real E2E regression matrix

The release cannot be called v1.2-ready until all blocking Chromium scenarios pass:

### B1 Normal COMPLETE
Master Task -> Bridge -> Fresh Worker -> Result -> Bridge -> original Master.

### B2 Context Firewall
Worker Project contains similar old chat/artifact; Bridge transports only the current packet into a Fresh Chat.

### B3 Malformed Task
Missing required field or wrong protocol; Bridge blocks.

### B4 Malformed Result
Invalid status or missing `artifact_ref`; Bridge blocks.

### B5 Wrong task_id
Fail closed.

### B6 Worker Fresh Chat failure
No injection into old chat; enter manual-new-chat recovery.

### B7 Master tab closed
Exact saved Master URL reopens.

### B8 Browser restart
Active relay resumes from local storage.

### B9 Selector regression
Primary locator fails; secondary locator works.

### B10 All locators fail
Safe failure; manual Relay remains available.

### B11 Extension disabled
Both v1.1 Skills still operate normally by manual copy/paste.

---

## 40. Stage 4 implementation slices

Implementation MUST proceed in this order:

### 4A — Skeleton
- WXT + TypeScript project
- popup
- background
- content script
- minimum permissions
- local storage wrapper

### 4B — Protocol core
- YAML safe parser
- Zod Task/Result schemas
- hashing
- validation diagnostics
- unit tests

### 4C — Relay FSM
- transition table
- controller
- single-active-relay rule
- persistence/recovery
- unit tests

### 4D — ChatGPT block detection
- adapter shell
- protocol candidate detection
- inline controls
- locator abstraction
- fixture tests

### 4E — Worker registration + open path
- `workerEntryUrl`
- tab coordination
- adapter health
- Fresh Chat proof
- recovery state

### 4F — Task staging
- composer detection
- exact YAML staging
- human confirmation
- posted-task verification

At this point the first milestone is complete:

```text
Master -> Worker stable
```

Only then continue:

### 4G — Result return
- result detection
- task ID gate
- Master reopen/focus
- result staging
- posted-result verification

### 4H — Diagnostics/recovery polish
- popup Resume/Cancel
- error surfaces
- diagnostics export
- history cap

### Stage 5 — Live Edge/Chrome E2E
Run B1-B11.

### Stage 6
Modify Skill/docs only if real Bridge testing proves a Skill-side change is required.

---

## 41. Definition of Stage 3A complete

Stage 3A is complete when:

- this specification is committed on the v1.2 development branch;
- v1.1 contracts are explicitly preserved;
- protocol validation rules are concrete;
- durable state schema is concrete;
- FSM and recovery semantics are concrete;
- permissions have a minimum baseline;
- posted-message verification is specified;
- Fresh Chat is treated as a verifiable invariant;
- test gates are defined;
- remaining unknowns are limited to live ChatGPT DOM/runtime facts.

---

## 42. Facts intentionally deferred to live prototype

The specification does not invent:

- production ChatGPT selectors;
- exact Project route structure;
- exact New Chat DOM controls;
- exact composer implementation;
- whether a rare browser operation ultimately forces an extra permission.

Those are implementation facts to discover in Stage 4/5 and MUST remain isolated behind `ChatGPTAdapter`.

---

## 43. External implementation references

- WXT manifest configuration: https://wxt.dev/guide/essentials/config/manifest
- WXT entrypoints: https://wxt.dev/guide/essentials/entrypoints
- WXT extension APIs: https://wxt.dev/guide/essentials/extension-apis
- WXT storage: https://wxt.dev/storage
- WXT unit testing / Vitest: https://wxt.dev/guide/essentials/unit-testing
- Chrome Tabs API permissions: https://developer.chrome.com/docs/extensions/reference/api/tabs
- Chrome extension messaging security guidance: https://developer.chrome.com/docs/extensions/develop/concepts/messaging
- YAML parser documentation: https://eemeli.org/yaml/

---

## 44. Final architectural invariant

> **The Bridge may automate transport, but it may never become a new source of research truth.**

The accepted v1.2 shape remains:

```text
research-dispatcher
        |
        | research-task/v1
        v
Browser Relay Bridge
        |
        | deterministic local transport
        v
Fresh research-worker Chat
        |
        | research-result/v1
        v
Browser Relay Bridge
        |
        | deterministic local transport
        v
original Master Chat
```

with bounded retries, fail-closed behavior, local persistence, minimum permissions, human-confirmed Send, and manual fallback at every stage.
