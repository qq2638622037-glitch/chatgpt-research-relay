// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'
import { findProtocolCandidates } from '../src/adapters/chatgpt/protocol-blocks'

const validTask = `protocol: research-task/v1
task_id: RR-20260918-DOM001
objective: "Verify a bounded fact."
decision_use: "Inform a decision."
known_facts: []
questions:
  - "What is true?"
scope:
  include: []
  exclude: []
constraints: []
artifact_inputs: []
source_policy:
  priority: []
  required: []
  forbidden: []
  freshness: "current"
research_budget:
  depth: light
  max_refinement_rounds: 1
output_contract:
  artifact_required: true
  artifact_target: "chat_file"
  master_digest_max_chars: 600
  expose_conflicts: true
  expose_uncertainty: true
stop_conditions:
  - "Evidence is sufficient."
`

const validResult = `protocol: research-result/v1
task_id: RR-20260918-DOM001
status: COMPLETE
confidence: HIGH
master_digest: "Closed."
key_findings: []
conflicts: []
unresolved: []
recommended_next_action: []
artifact_ref: "RR-20260918-DOM001_evidence.md"
`

describe('ChatGPT protocol block detection', () => {
  it('detects a valid task in a pre/code block', () => {
    document.body.innerHTML = `<pre><code></code></pre>`
    const code = document.querySelector('code')!
    code.textContent = validTask

    const found = findProtocolCandidates(document)
    expect(found).toHaveLength(1)
    expect(found[0]?.kind).toBe('task')
    expect(found[0]?.valid).toBe(true)
    expect(found[0]?.taskId).toBe('RR-20260918-DOM001')
  })

  it('detects a valid task in a pre-only block', () => {
    document.body.innerHTML = '<pre id="packet"></pre>'
    document.querySelector('#packet')!.textContent = validTask

    const found = findProtocolCandidates(document)
    expect(found).toHaveLength(1)
    expect(found[0]?.kind).toBe('task')
    expect(found[0]?.valid).toBe(true)
  })

  it('detects a code block even when code is nested inside wrappers', () => {
    document.body.innerHTML =
      '<pre><div class="code-body"><div><code id="packet"></code></div></div></pre>'
    document.querySelector('#packet')!.textContent = validTask

    const found = findProtocolCandidates(document)
    expect(found).toHaveLength(1)
    expect(found[0]?.element.id).toBe('packet')
    expect(found[0]?.valid).toBe(true)
  })

  it('rescans the nearest code ancestor when streaming adds an inner node', () => {
    document.body.innerHTML = '<pre><div><code id="packet"><span id="stream"></span></code></div></pre>'
    const code = document.querySelector('#packet')!
    code.textContent = validTask
    const streamRoot = document.createElement('span')
    streamRoot.id = 'stream-root'
    code.append(streamRoot)

    const found = findProtocolCandidates(streamRoot)
    expect(found).toHaveLength(1)
    expect(found[0]?.element).toBe(code)
    expect(found[0]?.valid).toBe(true)
  })

  it('detects multiple concrete blocks without guessing newest', () => {
    document.body.innerHTML = `
      <pre><code id="task"></code></pre>
      <pre><code id="result"></code></pre>
    `
    document.querySelector('#task')!.textContent = validTask
    document.querySelector('#result')!.textContent = validResult

    const found = findProtocolCandidates(document)
    expect(found.map((item) => item.kind)).toEqual(['task', 'result'])
  })

  it('ignores protocol text outside code/pre', () => {
    document.body.innerHTML = `<p>protocol: research-task/v1</p>`
    expect(findProtocolCandidates(document)).toHaveLength(0)
  })

  it('reports a malformed candidate as invalid', () => {
    document.body.innerHTML =
      '<pre><code>protocol: research-task/v1\ntask_id: RR-BAD</code></pre>'

    const found = findProtocolCandidates(document)
    expect(found).toHaveLength(1)
    expect(found[0]?.valid).toBe(false)
  })

  it('ignores candidates inside an editable surface', () => {
    document.body.innerHTML =
      '<div contenteditable="true"><pre><code></code></pre></div>'
    document.querySelector('code')!.textContent = validTask

    expect(findProtocolCandidates(document)).toHaveLength(0)
  })

  it('ignores protocol blocks inside explicit user messages', () => {
    document.body.innerHTML =
      '<article data-message-author-role="user"><pre><code id="packet"></code></pre></article>'
    document.querySelector('#packet')!.textContent = validTask

    expect(findProtocolCandidates(document)).toHaveLength(0)
  })

  it('accepts protocol blocks inside explicit assistant messages', () => {
    document.body.innerHTML =
      '<article data-message-author-role="assistant"><pre><div><code id="packet"></code></div></pre></article>'
    document.querySelector('#packet')!.textContent = validTask

    expect(findProtocolCandidates(document)).toHaveLength(1)
  })

  it('can scan a code element as the incremental root', () => {
    document.body.innerHTML = '<pre><code></code></pre>'
    const code = document.querySelector('code') as HTMLElement
    code.textContent = validTask

    expect(findProtocolCandidates(code)).toHaveLength(1)
  })
})
